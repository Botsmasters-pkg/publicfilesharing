/*CMD
  command: 📝 Upload Files
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: 📤 *Send any file, photo, video, document, or audio to upload:*

  keyboard: 
  aliases: 
  group: 
CMD*/

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var fileId = "";
var uniqueId = "";
var fileName = "File";
var fileSize = "N/A";
var fileType = "document";
var mimeType = "application/octet-stream";

if (request.document) {
  fileId = request.document.file_id;
  uniqueId = request.document.file_unique_id;
  fileName = request.document.file_name || "Document";
  fileSize = request.document.file_size ? (Math.round(request.document.file_size / 1024) + " KB") : "N/A";
  fileType = "document";
  mimeType = request.document.mime_type || "application/octet-stream";
} else if (request.photo && request.photo.length > 0) {
  var p = request.photo[request.photo.length - 1];
  fileId = p.file_id;
  uniqueId = p.file_unique_id;
  fileName = "Photo_" + uniqueId.slice(0, 8) + ".jpg";
  fileSize = p.file_size ? (Math.round(p.file_size / 1024) + " KB") : "N/A";
  fileType = "photo";
  mimeType = "image/jpeg";
} else if (request.video) {
  fileId = request.video.file_id;
  uniqueId = request.video.file_unique_id;
  fileName = request.video.file_name || ("Video_" + uniqueId.slice(0, 8) + ".mp4");
  fileSize = request.video.file_size ? (Math.round(request.video.file_size / 1024) + " KB") : "N/A";
  fileType = "video";
  mimeType = request.video.mime_type || "video/mp4";
} else if (request.audio) {
  fileId = request.audio.file_id;
  uniqueId = request.audio.file_unique_id;
  fileName = request.audio.file_name || request.audio.title || ("Audio_" + uniqueId.slice(0, 8) + ".mp3");
  fileSize = request.audio.file_size ? (Math.round(request.audio.file_size / 1024) + " KB") : "N/A";
  fileType = "audio";
  mimeType = request.audio.mime_type || "audio/mpeg";
} else if (request.voice) {
  fileId = request.voice.file_id;
  uniqueId = request.voice.file_unique_id;
  fileName = "Voice_" + uniqueId.slice(0, 8) + ".ogg";
  fileSize = request.voice.file_size ? (Math.round(request.voice.file_size / 1024) + " KB") : "N/A";
  fileType = "voice";
  mimeType = "audio/ogg";
} else {
  Api.sendMessage({
    text: "⚠️ <b>Please send a valid file, photo, video, or audio to upload!</b>",
    parse_mode: "HTML"
  });
  return;
}

// Generate brand-new unique ID every single upload (Har baar ID change)
function generateUniqueFileId() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var res = "BQADAQAD";
  for (var i = 0; i < 24; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

var generatedId = generateUniqueFileId();
while (Bot.getProperty("file_" + generatedId)) {
  generatedId = generateUniqueFileId();
}

// User Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";
var uHandle = user.username ? ("@" + user.username) : "None";

// Auto-detected Bot Username
var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");

// Storage Channel Config (Default: -1004304151228)
var storageChannelId = Bot.getProperty("storageChannel", "-1004304151228");
if (!storageChannelId || storageChannelId === "@https:" || storageChannelId.indexOf("https:") !== -1) {
  storageChannelId = "-1004304151228";
}

var uploads = Bot.getProperty("uploads", []);
var newId = uploads.length > 0 ? (uploads[uploads.length - 1].id + 1) : 1;

// Unique Link with the fresh generated ID:
var uniqueLink = "https://t.me/" + botUsername + "?start=" + generatedId;

var uploadRecord = {
  id: newId,
  uniqueKey: generatedId,
  fileUniqueId: generatedId,
  telegramUniqueId: uniqueId,
  fileId: fileId,
  fileName: fileName,
  fileSize: fileSize,
  fileType: fileType,
  mimeType: mimeType,
  userId: user.telegramid,
  ownerName: uFull,
  ownerUsername: user.username || "",
  storageChannelId: storageChannelId,
  status: "successful",
  uniqueLink: uniqueLink,
  timestamp: new Date().toISOString()
};

// Backup to Storage Channel in HTML mode
if (storageChannelId) {
  try {
    var caption = "📦 <b>New Storage Backup</b>\n" +
      "<code>———————————————————————</code>\n" +
      "📁 <b>Name:</b> " + escapeHtml(fileName) + "\n" +
      "📊 <b>Size:</b> " + escapeHtml(fileSize) + "\n" +
      "🏷️ <b>Type:</b> " + escapeHtml(fileType.toUpperCase()) + "\n" +
      "👤 <b>Owner:</b> " + escapeHtml(uFull) + " (<code>" + user.telegramid + "</code> | " + escapeHtml(uHandle) + ")\n" +
      "🔗 <b>Link:</b> " + escapeHtml(uniqueLink);

    if (fileType === "photo") {
      Api.sendPhoto({ chat_id: storageChannelId, photo: fileId, caption: caption, parse_mode: "HTML" });
    } else if (fileType === "video") {
      Api.sendVideo({ chat_id: storageChannelId, video: fileId, caption: caption, parse_mode: "HTML" });
    } else if (fileType === "audio" || fileType === "voice") {
      Api.sendAudio({ chat_id: storageChannelId, audio: fileId, caption: caption, parse_mode: "HTML" });
    } else {
      Api.sendDocument({ chat_id: storageChannelId, document: fileId, caption: caption, parse_mode: "HTML" });
    }
  } catch (e) {}
}

uploads.push(uploadRecord);
Bot.setProperty("uploads", uploads, "json");

// Save under the generated fresh unique key
Bot.setProperty("file_" + generatedId, uploadRecord, "json");
Bot.setProperty("file_" + fileId, uploadRecord, "json");
Bot.setProperty("file_" + uniqueId, uploadRecord, "json");

// Save to user specific list for My Files
var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
userFiles.push(uploadRecord);
Bot.setProperty("userFiles_" + user.telegramid, userFiles, "json");

// Legacy compatibility
Bot.setProperty(user.telegramid + "" + generatedId, uploadRecord, "json");
Bot.setProperty(user.telegramid + "" + uniqueId, uploadRecord, "json");

var keyb = [
  [{ text: "📂 View in My Files", callback_data: "/myfiles", style: "primary" }],
  [{ text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + fileName + ":"), style: "primary" }]
];

Api.sendMessage({
  text: "✅ <b>Upload Successful!</b>\n" +
    "<code>———————————————————————</code>\n" +
    "📦 <b>File Name:</b> <code>" + escapeHtml(fileName) + "</code>\n" +
    "📊 <b>File Size:</b> <code>" + escapeHtml(fileSize) + "</code>\n" +
    "📁 <b>File Type:</b> <code>" + escapeHtml(fileType.toUpperCase()) + "</code>\n" +
    "🏷️ <b>Storage Backup:</b> <code>Saved</code>\n\n" +
    "🔗 <b>Your Unique File Link:</b>\n" +
    "<code>" + escapeHtml(uniqueLink) + "</code>\n\n" +
    "<i>Anyone with this link can download your file!</i>",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
