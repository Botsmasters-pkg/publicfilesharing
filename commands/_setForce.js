/*CMD
  command: /setForce
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
  Bot.sendMessage("⚠️ Please provide channel ID or @username.\n_Example:_ `/setForce @mychannel`", { parse_mode: "Markdown" });
  return;
}

Bot.setProperty("forceChannel", params.trim(), "string");
Bot.sendMessage("✅ *Force Subscribe Channel has been set to:* `" + params.trim() + "`\nUsers will now be asked to join before downloading files.", { parse_mode: "Markdown" });

