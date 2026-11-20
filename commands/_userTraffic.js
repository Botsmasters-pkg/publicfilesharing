/*CMD
  command: /traffic
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📊 Traffic, Traffic
  group: 
CMD*/

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var userFileList = Bot.getProperty("userFiles_" + user.telegramid, []);
if (!userFileList || userFileList.length === 0) {
  userFileList = User.getProperty("userFileList", []) || [];
}

var totalUserUploads = userFileList ? userFileList.length : 0;
var totalUserDownloads = 0;

var lines = [];
var inlkey = [];

for (var i = 0; i < totalUserUploads; i++) {
  var item = userFileList[i];
  var itemKey = item.uniqueKey || item.fileUniqueId || item.file_unique_id;
  var fileInfo = Bot.getProperty("file_" + itemKey) || Bot.getProperty(user.telegramid + "" + itemKey) || item;
  var traffic = Bot.getProperty("traffic_" + itemKey, { count: 0 });
  var dlCount = traffic.count || 0;
  totalUserDownloads += dlCount;

  var fName = (fileInfo && (fileInfo.fileName || fileInfo.file_name)) ? (fileInfo.fileName || fileInfo.file_name) : ("File " + (i + 1));

  lines.push("• <b>" + (i + 1) + ". " + escapeHtml(fName) + "</b>\n  └ 📈 Downloads: <b>" + dlCount + "</b>");

  inlkey.push([
    { text: "📊 View Traffic #" + (i + 1) + " (" + dlCount + " DLs)", callback_data: "/fileTraffic " + itemKey, style: "primary" }
  ]);
}

var txt = "📊 <b>Personal Download Traffic Dashboard</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "👤 <b>Account:</b> " + escapeHtml(user.first_name || "User") + " (<code>#" + user.telegramid + "</code>)\n" +
  "📦 <b>Total Uploaded Files:</b> <b>" + totalUserUploads + "</b>\n" +
  "📈 <b>Total File Downloads:</b> <b>" + totalUserDownloads + "</b>\n\n";

if (totalUserUploads === 0) {
  txt += "<i>You have not uploaded any files yet.</i>\n\nClick <b>Upload Files</b> below to start sharing and tracking your downloads!";
  inlkey.push([{ text: "📝 Upload Files", callback_data: "📝 Upload Files", style: "primary" }]);
} else {
  txt += "<b>📁 Your Uploaded Files Traffic:</b>\n" + lines.join("\n\n") + "\n\n" +
    "<i>Click any file button below to see the exact users who downloaded it.</i>";
}

inlkey.push([{ text: "🗂 My Files", callback_data: "🗂 My Files", style: "primary" }]);

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
}
