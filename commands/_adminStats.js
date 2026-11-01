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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

var users = Bot.getProperty("allBotUsers", []);
var uploads = Bot.getProperty("uploads", []);
var logs = Bot.getProperty("downloadLogs", []);

// Real database calculations
var totalAttempts = uploads.length;
var successfulUploads = 0;
var failedUploads = 0;
var successfulUsersSet = {};
var failedUsersSet = {};

for (var i = 0; i < uploads.length; i++) {
  var up = uploads[i];
  if (up.status === "successful") {
    successfulUploads++;
    if (up.userId) {
      successfulUsersSet[up.userId] = true;
    }
  } else {
    failedUploads++;
    if (up.userId) {
      failedUsersSet[up.userId] = true;
    }
  }
}

var totalSuccessfulUsers = Object.keys(successfulUsersSet).length;
var totalFailedUsers = Object.keys(failedUsersSet).length;
var totalDownloads = logs.length;
var storageChannel = Bot.getProperty("storageChannel", "-1004304151228");

var msg = "📈 *Professional Upload & Bot Statistics*\n`———————————————————————`\n\n" +
  "👥 *Total Registered Users:* *" + users.length + "*\n\n" +
  "📦 *Upload Analytics:*\n" +
  "• Total Upload Attempts: *" + totalAttempts + "*\n" +
  "• Total Successful Uploads: *" + successfulUploads + "*\n" +
  "• Total Failed Uploads: *" + failedUploads + "*\n" +
  "• Total Uploaded Files: *" + successfulUploads + "*\n\n" +
  "👤 *User Performance:*\n" +
  "• Total Successful Users: *" + totalSuccessfulUsers + "*\n" +
  "• Total Failed Users: *" + totalFailedUsers + "*\n\n" +
  "📥 *Traffic Analytics:*\n" +
  "• Total Real Downloads: *" + totalDownloads + "*\n\n" +
  "🗄️ *Storage & System:*\n" +
  "• Storage Channel: `" + storageChannel + "`\n" +
  "• Total Storage Records: *" + uploads.length + "*\n\n" +
  "_All statistics are calculated live from real database records._";

var keyb = [
  [{ text: "🔄 Refresh Stats", callback_data: "/adminStats" }],
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
