/*CMD
  command: /clearForce
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

Bot.setProperty("forceChannel", null);
Bot.sendMessage("🗑️ *Force Channel removed.* Users can now download directly.", { parse_mode: "Markdown" });

