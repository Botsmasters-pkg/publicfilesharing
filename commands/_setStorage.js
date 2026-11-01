/*CMD
  command: /setStorage
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

if (!params) {
  Bot.sendMessage("⚠️ Please provide channel ID or @username.\n_Example:_ `/setStorage @mychannel`", { parse_mode: "Markdown" });
  return;
}

Bot.setProperty("storageChannel", params.trim(), "string");
Bot.sendMessage("✅ *Storage Channel has been set to:* `" + params.trim() + "`\nAll new uploaded files will be backed up here.", { parse_mode: "Markdown" });

