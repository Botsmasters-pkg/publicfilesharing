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

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId);
if (!file) {
  var id = uniqueId.slice(0, 10);
  var fil = uniqueId.slice(10, 40);
  file = Bot.getProperty(id + "" + fil) || Bot.getProperty(uniqueId);
}

if (!file || (!file.fileId && !file.file_id)) {
  Bot.sendMessage("⚠️ *File Not Found or Link Expired!*", { parse_mode: "Markdown" });
  return;
}

var targetFileId = file.fileId || file.file_id;
var targetUniqueId = file.fileUniqueId || file.file_unique_id || uniqueId;
var targetFileName = file.fileName || file.file_name || "File";
var targetFileType = file.fileType || "document";

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

// Save to global downloadLogs for stats and CSV export
var downloadLogs = Bot.getProperty("downloadLogs", []);
downloadLogs.push({
  fileId: file.id || 0,
  fileUniqueId: targetUniqueId,
  downloaderId: user.telegramid,
  downloaderName: uFull,
  downloaderUsername: user.username || "",
  timestamp: new Date().toISOString()
});
Bot.setProperty("downloadLogs", downloadLogs, "json");

var botUsername = (Bot.getProperty("bot_username") || bot.name || "FileStoreToxicBot").replace("@", "");

// Send File according to media type
var caption = "📥 *File Download Complete!*\n`———————————————————————`\n" +
  "📦 *Name:* " + targetFileName + "\n" +
  "📊 *Size:* " + (file.fileSize || "N/A") + "\n\n" +
  "_Downloaded via @" + botUsername + "_";

if (targetFileType === "photo") {
  Api.sendPhoto({ chat_id: user.telegramid, photo: targetFileId, caption: caption, parse_mode: "Markdown" });
} else if (targetFileType === "video") {
  Api.sendVideo({ chat_id: user.telegramid, video: targetFileId, caption: caption, parse_mode: "Markdown" });
} else if (targetFileType === "audio" || targetFileType === "voice") {
  Api.sendAudio({ chat_id: user.telegramid, audio: targetFileId, caption: caption, parse_mode: "Markdown" });
} else {
  Api.sendDocument({ chat_id: user.telegramid, document: targetFileId, caption: caption, parse_mode: "Markdown" });
}
