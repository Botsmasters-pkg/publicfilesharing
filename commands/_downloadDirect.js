/*CMD
  command: /downloadDirect
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!params) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var targetId = params.trim();
var file = Bot.getProperty("file_" + targetId);
if (!file) {
  var id = targetId.slice(0, 10);
  var fil = targetId.slice(10, 40);
  file = Bot.getProperty(id + "" + fil) || Bot.getProperty(targetId);
}

// targetFileId is either from database record or targetId directly (Telegram File ID)
var targetFileId = (file && (file.fileId || file.file_id)) ? (file.fileId || file.file_id) : targetId;
var targetUniqueId = (file && (file.fileUniqueId || file.file_unique_id)) ? (file.fileUniqueId || file.file_unique_id) : targetId;
var targetFileName = (file && (file.fileName || file.file_name)) ? (file.fileName || file.file_name) : "File";
var targetFileType = (file && file.fileType) ? file.fileType : "document";

// Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";
var uHandle = user.username ? ("@" + user.username) : "";

// Log download traffic for file owner
var trafficKey = targetUniqueId;
var traffic = Bot.getProperty("traffic_" + trafficKey, { count: 0, downloaders: [] });
traffic.count = (traffic.count || 0) + 1;
traffic.downloaders = traffic.downloaders || [];

var now = new Date().toISOString().slice(0, 19).replace("T", " ");
traffic.downloaders.push({
  id: user.telegramid,
  name: uFull,
  username: user.username || "",
  date: now
});
Bot.setProperty("traffic_" + trafficKey, traffic, "json");
// Also save under targetId if different
if (targetId !== trafficKey) {
  Bot.setProperty("traffic_" + targetId, traffic, "json");
}

// Save to global downloadLogs for stats and CSV export
var downloadLogs = Bot.getProperty("downloadLogs", []);
downloadLogs.push({
  fileId: (file && file.id) ? file.id : 0,
  fileUniqueId: targetUniqueId,
  downloaderId: user.telegramid,
  downloaderName: uFull,
  downloaderUsername: user.username || "",
  timestamp: new Date().toISOString()
});
Bot.setProperty("downloadLogs", downloadLogs, "json");

var botUsername = (Bot.getProperty("bot_username") || "toxicfighterobot").replace("@", "");

// Send File according to media type with safe HTML parse mode and clickable bot username link
var caption = "📥 <b>File Download Complete!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>Name:</b> <code>" + escapeHtml(targetFileName) + "</code>\n" +
  (file && file.fileSize ? ("📊 <b>Size:</b> " + escapeHtml(file.fileSize) + "\n\n") : "\n") +
  "🤖 <i>Downloaded via <a href=\"https://t.me/" + escapeHtml(botUsername) + "\">@" + escapeHtml(botUsername) + "</a></i>";

if (targetFileType === "photo") {
  Api.sendPhoto({ chat_id: user.telegramid, photo: targetFileId, caption: caption, parse_mode: "HTML" });
} else if (targetFileType === "video") {
  Api.sendVideo({ chat_id: user.telegramid, video: targetFileId, caption: caption, parse_mode: "HTML" });
} else if (targetFileType === "audio" || targetFileType === "voice") {
  Api.sendAudio({ chat_id: user.telegramid, audio: targetFileId, caption: caption, parse_mode: "HTML" });
} else {
  Api.sendDocument({ chat_id: user.telegramid, document: targetFileId, caption: caption, parse_mode: "HTML" });
}
