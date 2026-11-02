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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var allUsers = Bot.getProperty("allBotUsers", []);
var uploads = Bot.getProperty("uploads", []);
var downloadLogs = Bot.getProperty("downloadLogs", []);
var storageChannel = Bot.getProperty("storageChannel", "-1004304151228");

var totalAttempts = uploads.length;
var successfulUploads = 0;
var failedUploads = 0;
var successfulUserSet = {};
var failedUserSet = {};

for (var i = 0; i < uploads.length; i++) {
  var item = uploads[i];
  if (item.status === "successful") {
    successfulUploads++;
    if (item.userId) successfulUserSet[item.userId] = true;
  } else if (item.status === "failed") {
    failedUploads++;
    if (item.userId) failedUserSet[item.userId] = true;
  } else {
    successfulUploads++;
    if (item.userId) successfulUserSet[item.userId] = true;
  }
}

var totalSuccessfulUsers = Object.keys(successfulUserSet).length;
var totalFailedUsers = Object.keys(failedUserSet).length;
var totalDownloads = downloadLogs.length;

var msg = "📊 <b>File Store Real-Time Statistics</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "👥 <b>User Growth Analytics:</b>\n" +
  "• Total Registered Users: <b>" + allUsers.length + "</b>\n\n" +
  "📤 <b>Upload Records Analytics:</b>\n" +
  "• Total Upload Attempts: <b>" + totalAttempts + "</b>\n" +
  "• Total Successful Uploads: <b>" + successfulUploads + "</b>\n" +
  "• Total Failed Uploads: <b>" + failedUploads + "</b>\n" +
  "• Total Uploaded Files: <b>" + successfulUploads + "</b>\n\n" +
  "👤 <b>User Performance:</b>\n" +
  "• Total Successful Users: <b>" + totalSuccessfulUsers + "</b>\n" +
  "• Total Failed Users: <b>" + totalFailedUsers + "</b>\n\n" +
  "📥 <b>Traffic Analytics:</b>\n" +
  "• Total Real Downloads: <b>" + totalDownloads + "</b>\n\n" +
  "🗄️ <b>Storage & System:</b>\n" +
  "• Storage Channel: <code>" + escapeHtml(storageChannel) + "</code>\n" +
  "• Total Storage Records: <b>" + uploads.length + "</b>\n\n" +
  "<i>All statistics are calculated live from real database records.</i>";

var keyb = [
  [{ text: "🔄 Refresh Stats", callback_data: "/adminStats" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
}
