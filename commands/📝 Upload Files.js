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
  Bot.sendMessage("⚠️ *Please send a valid file, photo, video, or audio to upload!*", { parse_mode: "Markdown" });
  return;
}

// Storage Channel Config (Default: -1004304151228)
var storageChannelId = Bot.getProperty("storageChannel", "-1004304151228");

var uploads = Bot.getProperty("uploads", []);
var newId = uploads.length > 0 ? (uploads[uploads.length - 1].id + 1) : 1;
var uniqueLink = "https://t.me/" + bot.name + "?start=" + uniqueId;

var uploadRecord = {
  id: newId,
  fileUniqueId: uniqueId,
  fileId: fileId,
  fileName: fileName,
  fileSize: fileSize,
  fileType: fileType,
  mimeType: mimeType,
  userId: user.telegramid,
  ownerName: user.first_name || "User",
  ownerUsername: user.username || "",
  storageChannelId: storageChannelId,
  status: "failed",
  uniqueLink: uniqueLink,
  timestamp: new Date().toISOString()
};

var isSuccess = false;
try {
  var caption = "📦 *New Storage Backup*\n`———————————————————————`\n" +
    "📁 *Name:* " + fileName + "\n" +
    "📊 *Size:* " + fileSize + "\n" +
    "🏷️ *Type:* " + fileType.toUpperCase() + "\n" +
    "👤 *Owner:* `" + user.telegramid + "` (@" + (user.username || "None") + ")\n" +
    "🔗 *Link:* " + uniqueLink;

  if (fileType === "photo") {
    Api.sendPhoto({ chat_id: storageChannelId, photo: fileId, caption: caption, parse_mode: "Markdown" });
  } else if (fileType === "video") {
    Api.sendVideo({ chat_id: storageChannelId, video: fileId, caption: caption, parse_mode: "Markdown" });
  } else if (fileType === "audio" || fileType === "voice") {
    Api.sendAudio({ chat_id: storageChannelId, audio: fileId, caption: caption, parse_mode: "Markdown" });
  } else {
    Api.sendDocument({ chat_id: storageChannelId, document: fileId, caption: caption, parse_mode: "Markdown" });
  }
  isSuccess = true;
} catch (e) {
  isSuccess = false;
}

if (isSuccess) {
  uploadRecord.status = "successful";
  uploads.push(uploadRecord);
  Bot.setProperty("uploads", uploads, "json");
  Bot.setProperty("file_" + uniqueId, uploadRecord, "json");

  // Save to user specific list for My Files
  var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
  userFiles.push(uploadRecord);
  Bot.setProperty("userFiles_" + user.telegramid, userFiles, "json");

  // Legacy compatibility
  Bot.setProperty(user.telegramid + "" + uniqueId, uploadRecord, "json");

  var keyb = [
    [{ text: "📂 View in My Files", callback_data: "/myfiles" }],
    [{ text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + fileName + ":") }]
  ];

  Api.sendMessage({
    text: "✅ *Upload Successful!*\n`———————————————————————`\n" +
      "📦 *File Name:* `" + fileName + "`\n" +
      "📊 *File Size:* `" + fileSize + "`\n" +
      "📁 *File Type:* `" + fileType.toUpperCase() + "`\n" +
      "🏷️ *Storage Backup:* `Saved`\n\n" +
      "🔗 *Your Unique File Link:*\n`" + uniqueLink + "`\n\n" +
      "_Anyone with this link can download your file!_",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  uploadRecord.status = "failed";
  uploads.push(uploadRecord);
  Bot.setProperty("uploads", uploads, "json");

  Bot.sendMessage("❌ *Upload Failed!*\nCould not backup file to storage channel. Please verify storage channel settings.", { parse_mode: "Markdown" });
}
