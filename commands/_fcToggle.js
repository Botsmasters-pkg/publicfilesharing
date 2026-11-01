/*CMD
  command: /fcToggle
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (!params) return;
var idx = parseInt(params.trim());

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

var ch = forceChannels[idx];
if (ch.enabled === false) {
  ch.enabled = true;
} else {
  ch.enabled = false;
}

Bot.setProperty("forceChannels", forceChannels, "json");

Bot.runCommand("/fcList");
