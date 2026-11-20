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

var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null);

if (!hasMedia) {
  // User clicked "📝 Upload Files" button on keyboard
  Api.sendMessage({
    chat_id: targetChat,
    text: "📤 <b>Send or forward any file, photo, video, document, or audio to upload:</b>\n\n<i>You can also forward posts with captions directly from any channel!</i>",
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

// Extract caption if forwarded with text or sent with caption
var incomingCaption = request.caption || (request.message && request.message.caption) || "";

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
    chat_id: targetChat,
    text: "⚠️ <b>Please send a valid file, photo, video, or audio to upload!</b>",
    parse_mode: "HTML"
  });
  return;
}

// If it is a video/photo and has caption, smart auto-title from first line of caption
if (incomingCaption && (fileName.indexOf("Video_") === 0 || fileName.indexOf("Photo_") === 0)) {
  var firstLine = incomingCaption.split("\n")[0].trim().replace(/[<>:"/\\|?*]/g, "");
  if (firstLine.length > 0) {
    var ext = fileType === "video" ? ".mp4" : ".jpg";
    fileName = (firstLine.length > 45 ? firstLine.slice(0, 45) : firstLine) + ext;
  }
}

// Save as temporary draft for confirmation / caption editing
var draft = {
  fileId: fileId,
  uniqueId: uniqueId,
  fileName: fileName,
  fileSize: fileSize,
  fileType: fileType,
  mimeType: mimeType,
  caption: incomingCaption ? incomingCaption.trim() : "",
  userId: user.telegramid
};

Bot.setProperty("temp_upload_" + user.telegramid, draft, "json");
Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

var captionBox = draft.caption && draft.caption.length > 0 ?
  ("📝 <b>Current Caption:</b>\n<blockquote>" + escapeHtml(draft.caption) + "</blockquote>\n") :
  ("📝 <b>Current Caption:</b> <i>(No caption attached)</i>\n");

var previewMsg = "📦 <b>File Received & Ready!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📁 <b>Name:</b> <code>" + escapeHtml(draft.fileName) + "</code>\n" +
  "📊 <b>Size:</b> <code>" + escapeHtml(draft.fileSize) + "</code>\n" +
  "🏷️ <b>Type:</b> <code>" + escapeHtml(draft.fileType.toUpperCase()) + "</code>\n\n" +
  captionBox + "\n" +
  "👉 <i>Caption yahi rakhna hai ya edit karna chahte hain?</i>\n" +
  "Click <b>Done & Upload</b> to proceed, or <b>Edit Caption</b> to change it:";

var keyb = [
  [
    { text: "✏️ Edit Caption", callback_data: "/editCaption" },
    { text: "✅ Done & Upload", callback_data: "/confirmUpload" }
  ],
  [
    { text: "❌ Cancel", callback_data: "/cancelUpload" }
  ]
];

Api.sendMessage({
  chat_id: targetChat,
  text: previewMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
