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

// Filter active non-expired channels
for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  if (!ch.expired) {
    if (ch.expiryTime > 0 && now >= ch.expiryTime) {
      ch.expired = true; // Auto-expired!
    } else {
      activeChannels.push(ch);
    }
  }
}
Bot.setProperty("forceChannels", forceChannels, "json");

// Legacy fallback
var legacyForce = Bot.getProperty("forceChannel");
if (legacyForce && activeChannels.length === 0) {
  activeChannels.push({
    id: legacyForce,
    name: "Channel",
    type: "public",
    link: legacyForce.indexOf("http") === 0 ? legacyForce : ("https://t.me/" + legacyForce.replace("@", ""))
  });
}

if (activeChannels.length === 0) {
  if (checkParam !== "none") {
    Bot.runCommand("/downloadDirect " + checkParam);
  } else {
    Bot.runCommand("/showMenu");
  }
  return;
}

// Check first channel or primary
var firstChannel = activeChannels[0];
Api.getChatMember({
  chat_id: firstChannel.id,
  user_id: user.telegramid,
  on_result: "/onCheckJoin " + checkParam,
  on_error: (checkParam !== "none" ? "/downloadDirect " + checkParam : "/showMenu")
});
