/*CMD
  command: /setWelcome
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

if (!params) {
  Bot.sendMessage("⚠️ Please write the new welcome text.\n_Example:_ `/setWelcome Hello! Welcome to our Bot.`", { parse_mode: "Markdown" });
  return;
}

Bot.setProperty("welcomeMessage", params, "string");
Bot.sendMessage("✅ *Welcome message updated successfully!*", { parse_mode: "Markdown" });
