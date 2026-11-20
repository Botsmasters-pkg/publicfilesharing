/*CMD
  command: 📝 Upload Files
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
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

var hasMedia = request && (request.document || (request.photo && request.photo.length > 0) || request.video || request.audio || request.voice);

if (!hasMedia) {
  // User tapped "📝 Upload Files" button on keyboard
  var promptChatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null);
  Api.sendMessage({
    chat_id: promptChatId,
    text: "📤 <b>Send any file, photo, video, document, or audio to upload:</b>",
    parse_mode: "HTML"
  });
  return;
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
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
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

var totalUploads = (Bot.getProperty("total_uploads_count", 0) || 0) + 1;
Bot.setProperty("total_uploads_count", totalUploads, "integer");

var totalSuccessful = (Bot.getProperty("total_successful_uploads", 0) || 0) + 1;
Bot.setProperty("total_successful_uploads", totalSuccessful, "integer");

var uploads = Bot.getProperty("uploads", []);
if (!Array.isArray(uploads)) { uploads = []; }
var newId = totalUploads > uploads.length ? totalUploads : (uploads.length > 0 ? (uploads[uploads.length - 1].id + 1) : 1);

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

// Keep uploads array capped to latest 20 items so it NEVER exceeds Bots.Business 20KB limit
uploads.push(uploadRecord);
if (uploads.length > 20) {
  uploads = uploads.slice(-20);
}
try {
  Bot.setProperty("uploads", uploads, "json");
} catch (e) {}

// Save under the generated fresh unique key
try {
  Bot.setProperty("file_" + generatedId, uploadRecord, "json");
  Bot.setProperty("file_" + fileId, uploadRecord, "json");
  Bot.setProperty("file_" + uniqueId, uploadRecord, "json");
} catch (e) {}

// Save to user specific list for My Files (capped to 30 items)
var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
if (!Array.isArray(userFiles)) { userFiles = []; }
userFiles.push(uploadRecord);
if (userFiles.length > 30) {
  userFiles = userFiles.slice(-30);
}
try {
  Bot.setProperty("userFiles_" + user.telegramid, userFiles, "json");
} catch (e) {}

// Sync to User property for Traffic dashboard
try {
  var uList = User.getProperty("userFileList", []);
  if (!Array.isArray(uList)) { uList = []; }
  uList.push({
    file_unique_id: generatedId,
    file_name: fileName,
    file_type: fileType,
    uniqueLink: uniqueLink
  });
  if (uList.length > 30) {
    uList = uList.slice(-30);
  }
  User.setProperty("userFileList", uList, "json");
} catch (e) {}

// Legacy compatibility
try {
  Bot.setProperty(user.telegramid + "" + generatedId, uploadRecord, "json");
  Bot.setProperty(user.telegramid + "" + uniqueId, uploadRecord, "json");
} catch (e) {}

var keyb = [
  [{ text: "📂 View in My Files", callback_data: "/myfiles", style: "primary" }],
  [{ text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + fileName + ":"), style: "primary" }]
];

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
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
