/*CMD
  command: /clearWelcome
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
if (!isAdmin) return;

Bot.setProperty("welcomeMessage", null);
Bot.sendMessage("✅ *Welcome message reset to default!*", { parse_mode: "Markdown" });

