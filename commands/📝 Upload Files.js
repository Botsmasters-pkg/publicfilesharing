/*CMD
  command: 📝 Upload Files
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: 📤 *Send any file, photo, video, or audio to upload in the bot:*

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
  fileSize = request.document.file_size;
  fileType = "document";
  mimeType = request.document.mime_type || "application/octet-stream";
} else if (request.photo && request.photo.length > 0) {
  var p = request.photo[request.photo.length - 1];
  fileId = p.file_id;
  uniqueId = p.file_unique_id;
  fileName = "Photo_" + uniqueId.slice(0, 8) + ".jpg";
  fileSize = p.file_size;
  fileType = "photo";
  mimeType = "image/jpeg";
} else if (request.video) {
  fileId = request.video.file_id;
  uniqueId = request.video.file_unique_id;
  fileName = request.video.file_name || ("Video_" + uniqueId.slice(0, 8) + ".mp4");
  fileSize = request.video.file_size;
  fileType = "video";
  mimeType = request.video.mime_type || "video/mp4";
} else if (request.audio) {
  fileId = request.audio.file_id;
  uniqueId = request.audio.file_unique_id;
  fileName = request.audio.file_name || request.audio.title || ("Audio_" + uniqueId.slice(0, 8) + ".mp3");
  fileSize = request.audio.file_size;
  fileType = "audio";
  mimeType = request.audio.mime_type || "audio/mpeg";
} else if (request.voice) {
  fileId = request.voice.file_id;
  uniqueId = request.voice.file_unique_id;
  fileName = "Voice_" + uniqueId.slice(0, 8) + ".ogg";
  fileSize = request.voice.file_size;
  fileType = "voice";
  mimeType = "audio/ogg";
} else {
  Bot.sendMessage("⚠️ *Please send a file, photo, video, or audio!*", { parse_mode: "Markdown" });
  return;
}

var fileRecord = {
  file_id: fileId,
  file_unique_id: uniqueId,
  file_name: fileName,
  file_size: fileSize,
  file_type: fileType,
  mime_type: mimeType,
  owner_id: user.telegramid,
  owner_name: user.first_name || "User",
  owner_username: user.username || "",
  uploaded_at: new Date().toISOString()
};

// Store file info
Bot.setProperty(user.telegramid + "" + uniqueId, fileRecord, "json");
Bot.setProperty("file_" + uniqueId, fileRecord, "json");

var keyb = [
  [
    {
      text: "📪 Upload To Server",
      callback_data: "/uploadDocument " + uniqueId
    }
  ]
];

Api.sendMessage({
  text:
    "*🗂 File Received!*\n`———————————————————————`\n📦 *Name :* " +
    fileName +
    "\n📊 *Size :* " +
    fileSize +
    "\n📁 *Type :* " +
    fileType.toUpperCase() +
    "\n\n_Click the button below to save to your files:_",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
