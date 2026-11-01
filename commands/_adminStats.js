/*CMD
  command: /adminStats
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

var allUsers = Bot.getProperty("allBotUsers", []);
var allFiles = Bot.getProperty("allBotFiles", []);
var totalFilesCount = Bot.getProperty("totalFilesCount", allFiles.length);
var totalDownloads = Bot.getProperty("totalDownloadsCount", 0);
var storageChannel = Bot.getProperty("storageChannel", "Not Configured");
var forceChannel = Bot.getProperty("forceChannel", "Not Configured");

var msg = "📈 *Global Bot Statistics*\n`———————————————————————`\n\n";
msg += "👥 *Total Users:* " + allUsers.length + "\n";
msg += "📦 *Total Files Uploaded:* " + totalFilesCount + "\n";
msg += "📥 *Total Downloads:* " + totalDownloads + "\n";
msg += "🏷️ *Storage Channel:* `" + storageChannel + "`\n";
msg += "🔧 *Host/Force Channel:* `" + forceChannel + "`\n";

var keyb = [
  [{ text: "🔄 Refresh", callback_data: "/adminStats" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
