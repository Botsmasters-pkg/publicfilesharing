/*CMD
  command: /fcReactivate
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

if (params) {
  Bot.runCommand("/fcSelectTimer " + params.trim());
} else {
  Bot.runCommand("/fcTimerMenu");
}
