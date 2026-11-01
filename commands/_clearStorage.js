/*CMD
  command: /clearStorage
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

Bot.setProperty("storageChannel", null);
Bot.sendMessage("🗑️ *Storage Channel has been removed.*", { parse_mode: "Markdown" });
