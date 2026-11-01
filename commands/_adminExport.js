/*CMD
  command: /adminExport
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

var allUsers = Bot.getProperty("allBotUsers", []);
var uploads = Bot.getProperty("uploads", []);
var logs = Bot.getProperty("downloadLogs", []);

var userRows = ["User_ID,First_Name,Last_Name,Username,Joined_At,Total_User_Uploads"];
for (var i = 0; i < allUsers.length; i++) {
  var uid = allUsers[i];
  var uInfo = Bot.getProperty("userInfo_" + uid, { first_name: "", last_name: "", username: "", joined_at: "" });
  var userUploads = uploads.filter(function(u) { return u.userId == uid && u.status === "successful"; }).length;

  userRows.push([
    uid,
    '"' + (uInfo.first_name || "").replace(/"/g, '""') + '"',
    '"' + (uInfo.last_name || "").replace(/"/g, '""') + '"',
    '"' + (uInfo.username || "") + '"',
    '"' + (uInfo.joined_at || "") + '"',
    userUploads
  ].join(","));
}

var fileRows = ["File_Record_ID,File_Unique_ID,File_Name,File_Type,File_Size,Owner_ID,Status,Total_Downloads,Uploaded_At"];
for (var j = 0; j < uploads.length; j++) {
  var up = uploads[j];
  var tr = Bot.getProperty("traffic_" + up.fileUniqueId, { count: 0 });
  fileRows.push([
    up.id || (j + 1),
    up.fileUniqueId,
    '"' + (up.fileName || "").replace(/"/g, '""') + '"',
    '"' + (up.fileType || "document") + '"',
    '"' + (up.fileSize || "N/A") + '"',
    up.userId || "N/A",
    up.status || "successful",
    tr.count || 0,
    '"' + (up.timestamp || "") + '"'
  ].join(","));
}

var csvContent = "=== 1. BOT USERS EXPORT ===\n" + userRows.join("\n") + "\n\n=== 2. UPLOADS & TRAFFIC EXPORT ===\n" + fileRows.join("\n");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

var preview = "📑 *Complete Database CSV Export*\n`———————————————————————`\n" +
  "• Users Exported: *" + allUsers.length + "*\n" +
  "• Upload Records: *" + uploads.length + "*\n" +
  "• Download Logs: *" + logs.length + "*\n\n" +
  "```csv\n" + csvContent.slice(0, 3600) + "\n```";

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: preview,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: preview,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
