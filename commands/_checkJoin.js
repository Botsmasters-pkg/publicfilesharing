/*CMD
  command: /checkJoin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (request.data) {
  try {
    Api.deleteMessage({
      chat_id: request.message.chat.id,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

var checkParam = (params && params.trim() !== "") ? params.trim() : "none";
var forceChannels = Bot.getProperty("forceChannels", []);
var now = Date.now();
var activeChannels = [];

for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  if (ch.enabled === false) continue;
  if (!ch.id || ch.id.indexOf("/fc") !== -1 || (ch.link && ch.link.indexOf("/fc") !== -1)) continue;
  if (!ch.expired) {
    if (ch.expiryTime > 0 && now >= ch.expiryTime) {
      ch.expired = true;
    } else {
      activeChannels.push(ch);
    }
  }
}
Bot.setProperty("forceChannels", forceChannels, "json");

// Filter channels: join request channels are considered verified immediately upon checking
// As requested: "यूजर रिक्वेस्ट भेज देता है, उसके बाद वेरीफाई माना जाएगा। एडमिन अप्रूव करे या न करे, रिक्वेस्ट पेंडिंग भी रहे तो वेरीफाई माना जाए।"
var channelsToCheck = [];
for (var c = 0; c < activeChannels.length; c++) {
  var channel = activeChannels[c];
  if (channel.type === "request") {
    Bot.setProperty("join_req_" + channel.id + "_" + user.telegramid, true, "boolean");
  } else {
    channelsToCheck.push(channel);
  }
}

// If all channels are satisfied, verify immediately!
if (channelsToCheck.length === 0) {
  var successMsg = "🟢 <b>All Channels Verified Successfully!</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "Thank you! You now have full access to use the bot.";

  Api.sendMessage({
    text: successMsg,
    parse_mode: "HTML"
  });

  if (checkParam !== "none") {
    Bot.runCommand("/downloadDirect " + checkParam);
  } else {
    Bot.runCommand("/showMenu");
  }
  return;
}

// Store queue and unjoined list for remaining channels
Bot.setProperty("verify_queue_" + user.telegramid, channelsToCheck, "json");
Bot.setProperty("verify_unjoined_" + user.telegramid, [], "json");

// Check first channel directly via Api.getChatMember
var firstChannel = channelsToCheck[0];
Api.getChatMember({
  chat_id: firstChannel.id,
  user_id: user.telegramid,
  on_result: "/onCheckJoin 0 " + checkParam,
  on_error: "/onCheckJoin 0 " + checkParam
});
