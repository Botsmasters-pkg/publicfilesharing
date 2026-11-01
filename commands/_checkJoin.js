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
  // Requirement #5: Skip disabled channels completely
  if (ch.enabled === false) continue;

  // Skip expired channels
  if (ch.expired) continue;
  if (ch.expiryTime > 0 && now >= ch.expiryTime) {
    ch.expired = true;
    continue;
  }
  activeChannels.push(ch);
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

// Requirement #4: Sequential verification of ALL enabled channels
Bot.setProperty("verify_queue_" + user.telegramid, activeChannels, "json");
Bot.setProperty("verify_unjoined_" + user.telegramid, [], "json");

Bot.runCommand("/verifyStep 0 " + checkParam);
