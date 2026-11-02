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
  Api.deleteMessage({
    chat_id: request.message.chat.id,
    message_id: request.message.message_id
  });
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

if (activeChannels.length === 0) {
  if (checkParam !== "none") {
    Bot.runCommand("/downloadDirect " + checkParam);
  } else {
    Bot.runCommand("/showMenu");
  }
  return;
}

// Store queue and unjoined list
Bot.setProperty("verify_queue_" + user.telegramid, activeChannels, "json");
Bot.setProperty("verify_unjoined_" + user.telegramid, [], "json");

// Check first channel directly via Api.getChatMember
var firstChannel = activeChannels[0];
Api.getChatMember({
  chat_id: firstChannel.id,
  user_id: user.telegramid,
  on_result: "/onCheckJoin 0 " + checkParam,
  on_error: "/onCheckJoin 0 " + checkParam
});
