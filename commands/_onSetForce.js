/*CMD
  command: /onSetForce
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

var text = (params || "").trim();
if (!text && request && request.message && request.message.text) {
  text = request.message.text.trim();
}

if (text) {
  Bot.runCommand("/fcSaveChannel " + text);
} else {
  Bot.runCommand("/fcAdd");
}
