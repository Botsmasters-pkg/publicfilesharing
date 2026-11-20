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

var reqMsg = (request && request.message) ? request.message : request;

var reqDoc = (reqMsg && reqMsg.document) || (request && request.document);
var reqPhoto = (reqMsg && reqMsg.photo) || (request && request.photo);
var reqVideo = (reqMsg && reqMsg.video) || (request && request.video);
var reqAudio = (reqMsg && reqMsg.audio) || (request && request.audio);
var reqVoice = (reqMsg && reqMsg.voice) || (request && request.voice);
var reqVideoNote = (reqMsg && reqMsg.video_note) || (request && request.video_note);

var hasMedia = !!(reqDoc || (reqPhoto && reqPhoto.length > 0) || reqVideo || reqAudio || reqVoice || reqVideoNote);

var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null);

if (!hasMedia) {
  // User clicked "📝 Upload Files" button on keyboard
  // Clear any lingering bulk/batch upload states so single upload is clean
  Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
  Bot.setProperty("batch_temp_" + user.telegramid, [], "json");
  Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");
  Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

  var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
  var primaryKeyboard = [
    [
      { text: "📝 Upload Files", style: "primary" },
      { text: "🗂 My Files", style: "primary" }
    ],
    [
      { text: "📦 Bulk Upload", style: "primary" },
      { text: "📊 Traffic", style: "primary" }
    ],
    [
      { text: "🆘 Support", style: "primary" }
    ]
  ];
  if (isAdmin) {
    primaryKeyboard.push([
      { text: "🛠 Admin Panel", style: "primary" }
    ]);
  }

  Api.sendMessage({
    chat_id: targetChat,
    text: "📤 <b>Send or forward any file, photo, video, document, or audio to upload:</b>\n\n<i>You can also forward posts with captions directly from any channel!</i>",
    parse_mode: "HTML",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
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
var incomingCaption = (reqMsg && reqMsg.caption) || (request && request.caption) || "";

if (reqDoc) {
  fileId = reqDoc.file_id;
  uniqueId = reqDoc.file_unique_id;
  fileName = reqDoc.file_name || "Document";
  fileSize = reqDoc.file_size ? (Math.round(reqDoc.file_size / 1024) + " KB") : "N/A";
  fileType = "document";
  mimeType = reqDoc.mime_type || "application/octet-stream";
} else if (reqPhoto && reqPhoto.length > 0) {
  var p = reqPhoto[reqPhoto.length - 1];
  fileId = p.file_id;
  uniqueId = p.file_unique_id;
  fileName = "Photo_" + uniqueId.slice(0, 8) + ".jpg";
  fileSize = p.file_size ? (Math.round(p.file_size / 1024) + " KB") : "N/A";
  fileType = "photo";
  mimeType = "image/jpeg";
} else if (reqVideo) {
  fileId = reqVideo.file_id;
  uniqueId = reqVideo.file_unique_id;
  fileName = reqVideo.file_name || ("Video_" + uniqueId.slice(0, 8) + ".mp4");
  fileSize = reqVideo.file_size ? (Math.round(reqVideo.file_size / 1024) + " KB") : "N/A";
  fileType = "video";
  mimeType = reqVideo.mime_type || "video/mp4";
} else if (reqAudio) {
  fileId = reqAudio.file_id;
  uniqueId = reqAudio.file_unique_id;
  fileName = reqAudio.file_name || reqAudio.title || ("Audio_" + uniqueId.slice(0, 8) + ".mp3");
  fileSize = reqAudio.file_size ? (Math.round(reqAudio.file_size / 1024) + " KB") : "N/A";
  fileType = "audio";
  mimeType = reqAudio.mime_type || "audio/mpeg";
} else if (reqVoice) {
  fileId = reqVoice.file_id;
  uniqueId = reqVoice.file_unique_id;
  fileName = "Voice_" + uniqueId.slice(0, 8) + ".ogg";
  fileSize = reqVoice.file_size ? (Math.round(reqVoice.file_size / 1024) + " KB") : "N/A";
  fileType = "voice";
  mimeType = "audio/ogg";
} else if (reqVideoNote) {
  fileId = reqVideoNote.file_id;
  uniqueId = reqVideoNote.file_unique_id;
  fileName = "VideoNote_" + uniqueId.slice(0, 8) + ".mp4";
  fileSize = reqVideoNote.file_size ? (Math.round(reqVideoNote.file_size / 1024) + " KB") : "N/A";
  fileType = "video";
  mimeType = "video/mp4";
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

// 📦 BULK UPLOAD MODE HANDLER (Silent collection without spamming messages!)
var isBatchActive = (Bot.getProperty("user_batch_state_" + user.telegramid) === "active");

if (isBatchActive) {
  // Generate unique file key for database
  function genId() {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var res = "BQADAQAD";
    for (var i = 0; i < 24; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }
  var genFileId = genId();
  while (Bot.getProperty("file_" + genFileId)) {
    genFileId = genId();
  }

  var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");
  var storageChannelId = Bot.getProperty("storageChannel", "-1004304151228");
  if (!storageChannelId || storageChannelId === "@https:" || storageChannelId.indexOf("https:") !== -1) {
    storageChannelId = "-1004304151228";
  }

  // Backup to storage channel
  var storageCaption = "📦 <b>Bulk Item Backup</b>\n" +
    "<code>———————————————————————</code>\n" +
    "📁 <b>Name:</b> <code>" + escapeHtml(fileName) + "</code>\n" +
    "📊 <b>Size:</b> <code>" + escapeHtml(fileSize) + "</code>\n" +
    "🏷️ <b>Type:</b> <code>" + escapeHtml(fileType.toUpperCase()) + "</code>\n" +
    "👤 <b>Uploaded by:</b> <code>#" + user.telegramid + "</code>\n" +
    "🔑 <b>Key:</b> <code>" + escapeHtml(genFileId) + "</code>";

  try {
    if (fileType === "photo") {
      Api.sendPhoto({ chat_id: storageChannelId, photo: fileId, caption: storageCaption, parse_mode: "HTML" });
    } else if (fileType === "video") {
      Api.sendVideo({ chat_id: storageChannelId, video: fileId, caption: storageCaption, parse_mode: "HTML" });
    } else if (fileType === "audio" || fileType === "voice") {
      Api.sendAudio({ chat_id: storageChannelId, audio: fileId, caption: storageCaption, parse_mode: "HTML" });
    } else {
      Api.sendDocument({ chat_id: storageChannelId, document: fileId, caption: storageCaption, parse_mode: "HTML" });
    }
  } catch (err) {}

  var fileObj = {
    fileId: fileId,
    file_id: fileId,
    fileUniqueId: genFileId,
    file_unique_id: genFileId,
    uniqueKey: genFileId,
    fileName: fileName,
    file_name: fileName,
    fileSize: fileSize,
    file_size: fileSize,
    fileType: fileType,
    mimeType: mimeType,
    caption: incomingCaption ? incomingCaption.trim() : "",
    userId: user.telegramid,
    status: "successful",
    timestamp: new Date().toISOString(),
    uniqueLink: "https://t.me/" + botUsername + "?start=" + genFileId
  };

  Bot.setProperty("file_" + genFileId, fileObj, "json");
  Bot.setProperty(user.telegramid + "" + genFileId, fileObj, "json");

  // Save to userFiles
  var uFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
  if (!Array.isArray(uFiles)) uFiles = [];
  uFiles.unshift(fileObj);
  if (uFiles.length > 20) uFiles = uFiles.slice(0, 20);
  Bot.setProperty("userFiles_" + user.telegramid, uFiles, "json");

  // Add to batch temp list
  var bTemp = Bot.getProperty("batch_temp_" + user.telegramid, []);
  if (!Array.isArray(bTemp)) bTemp = [];
  bTemp.push(genFileId);
  Bot.setProperty("batch_temp_" + user.telegramid, bTemp, "json");

  // If first file has a caption and batch caption is empty, save it as default
  var existingBatchCap = Bot.getProperty("batch_caption_" + user.telegramid, "");
  if (!existingBatchCap && incomingCaption && incomingCaption.trim().length > 0) {
    Bot.setProperty("batch_caption_" + user.telegramid, incomingCaption.trim(), "string");
  }

  // Silent upload: do NOT send any intermediate message in chat!
  // User will click the big [✅ Done] button on bottom keyboard when finished.
  return;
}

// 📄 SINGLE UPLOAD CONFIRMATION FLOW
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
