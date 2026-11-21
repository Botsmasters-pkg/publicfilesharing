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

function formatCaptionWithLinks(text, entities) {
  if (!text) return "";

  // 1. Process Telegram entities focusing on links and safe inline styles
  if (entities && Array.isArray(entities) && entities.length > 0) {
    var tags = [];
    for (var i = 0; i < entities.length; i++) {
      var ent = entities[i];
      var openTag = "";
      var closeTag = "";

      if (ent.type === "text_link" && ent.url) {
        openTag = '<a href="' + ent.url.replace(/"/g, '&quot;') + '">';
        closeTag = "</a>";
      } else if (ent.type === "bold") {
        openTag = "<b>"; closeTag = "</b>";
      } else if (ent.type === "italic") {
        openTag = "<i>"; closeTag = "</i>";
      } else if (ent.type === "code") {
        openTag = "<code>"; closeTag = "</code>";
      } else if (ent.type === "pre") {
        openTag = "<pre>"; closeTag = "</pre>";
      } else if (ent.type === "underline") {
        openTag = "<u>"; closeTag = "</u>";
      } else if (ent.type === "strikethrough") {
        openTag = "<s>"; closeTag = "</s>";
      } else if (ent.type === "spoiler") {
        openTag = "<tg-spoiler>"; closeTag = "</tg-spoiler>";
      } else if (ent.type === "text_mention" && ent.user) {
        openTag = '<a href="tg://user?id=' + ent.user.id + '">';
        closeTag = "</a>";
      }
      // Note: Deliberately exclude <blockquote> because Telegram media captions
      // reject blockquotes with a 400 error!

      if (openTag && closeTag) {
        tags.push({ pos: ent.offset, kind: "open", tag: openTag, len: ent.length });
        tags.push({ pos: ent.offset + ent.length, kind: "close", tag: closeTag, len: ent.length });
      }
    }

    if (tags.length > 0) {
      tags.sort(function(a, b) {
        if (a.pos !== b.pos) return a.pos - b.pos;
        if (a.kind !== b.kind) return a.kind === "close" ? -1 : 1;
        if (a.kind === "close") return a.len - b.len;
        return b.len - a.len;
      });

      var result = "";
      var lastPos = 0;
      for (var j = 0; j < tags.length; j++) {
        var t = tags[j];
        if (t.pos > lastPos) {
          result += escapeHtml(text.slice(lastPos, t.pos));
          lastPos = t.pos;
        }
        result += t.tag;
      }
      if (lastPos < text.length) {
        result += escapeHtml(text.slice(lastPos));
      }
      return result;
    }
  }

  // 2. Process Markdown hyperlinks like [text](https://example.com)
  if (/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/.test(text)) {
    var lastIdx = 0;
    var regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    var match;
    var res = "";
    while ((match = regex.exec(text)) !== null) {
      res += escapeHtml(text.slice(lastIdx, match.index));
      res += '<a href="' + match[2].replace(/"/g, '&quot;') + '">' + escapeHtml(match[1]) + '</a>';
      lastIdx = regex.lastIndex;
    }
    res += escapeHtml(text.slice(lastIdx));
    return res;
  }

  // 3. Raw HTML with anchor tag
  if (/<a\s+href=["'][^"']+["']>.*?<\/a>/i.test(text)) {
    return text;
  }

  return escapeHtml(text);
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
  // If user calls upload without sending media, activate Single Upload mode directly
  Bot.runCommand("/setUploadSingle");
  return;
}

// Media arrived! Extract file details safely
var fileId = "";
var uniqueId = "";
var fileName = "File";
var fileSize = "N/A";
var fileType = "document";
var mimeType = "application/octet-stream";

// Extract caption and entities preserving embedded hyperlinks (text_link)
var rawCaption = (reqMsg && reqMsg.caption) || (request && request.caption) || "";
var captionEntities = (reqMsg && reqMsg.caption_entities) || (request && request.caption_entities) || [];
var incomingCaption = formatCaptionWithLinks(rawCaption, captionEntities);

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

// Auto-title media from first line of caption if default photo/video title
if (incomingCaption && (fileName.indexOf("Video_") === 0 || fileName.indexOf("Photo_") === 0)) {
  var firstLine = incomingCaption.split("\n")[0].trim().replace(/[<>:"/\\|?*]/g, "");
  if (firstLine.length > 0) {
    var ext = fileType === "video" ? ".mp4" : ".jpg";
    fileName = (firstLine.length > 45 ? firstLine.slice(0, 45) : firstLine) + ext;
  }
}

// Check Bulk Upload Mode
var isBatchActive = (Bot.getProperty("user_batch_state_" + user.telegramid) === "active");

// Helper to generate unique 24-character ID
function genUniqueKey() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var res = "BQADAQAD";
  for (var i = 0; i < 24; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

var genFileId = genUniqueKey();
while (Bot.getProperty("file_" + genFileId)) {
  genFileId = genUniqueKey();
}

var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");
var uniqueLink = "https://t.me/" + botUsername + "?start=" + genFileId;

// Storage Channel Config
var storageChannelId = Bot.getProperty("storageChannel", "-1004304151228");
if (!storageChannelId || storageChannelId === "@https:" || storageChannelId.indexOf("https:") !== -1) {
  storageChannelId = "-1004304151228";
}

// Backup to Storage Channel
try {
  var backupCaption = (isBatchActive ? "📦 <b>Bulk Item Backup</b>\n" : "📦 <b>New File Backup</b>\n") +
    "<code>———————————————————————</code>\n" +
    "📁 <b>Name:</b> <code>" + escapeHtml(fileName) + "</code>\n" +
    "📊 <b>Size:</b> <code>" + escapeHtml(fileSize) + "</code>\n" +
    "🏷️ <b>Type:</b> <code>" + escapeHtml(fileType.toUpperCase()) + "</code>\n" +
    (incomingCaption ? ("📝 <b>Caption:</b> " + escapeHtml(incomingCaption.replace(/<[^>]+>/g, "").slice(0, 200)) + "\n") : "") +
    "👤 <b>Uploaded by:</b> <code>#" + user.telegramid + "</code> (@" + escapeHtml(user.username || "None") + ")\n" +
    "🔗 <b>Link:</b> " + escapeHtml(uniqueLink);

  if (fileType === "photo") {
    Api.sendPhoto({ chat_id: storageChannelId, photo: fileId, caption: backupCaption, parse_mode: "HTML" });
  } else if (fileType === "video") {
    Api.sendVideo({ chat_id: storageChannelId, video: fileId, caption: backupCaption, parse_mode: "HTML" });
  } else if (fileType === "audio" || fileType === "voice") {
    Api.sendAudio({ chat_id: storageChannelId, audio: fileId, caption: backupCaption, parse_mode: "HTML" });
  } else {
    Api.sendDocument({ chat_id: storageChannelId, document: fileId, caption: backupCaption, parse_mode: "HTML" });
  }
} catch (err) {}

// Build standard file record
var fileRecord = {
  fileId: fileId,
  file_id: fileId,
  fileUniqueId: genFileId,
  file_unique_id: genFileId,
  telegramUniqueId: uniqueId,
  uniqueKey: genFileId,
  fileName: fileName,
  file_name: fileName,
  fileSize: fileSize,
  file_size: fileSize,
  fileType: fileType,
  mimeType: mimeType,
  caption: incomingCaption ? incomingCaption.trim() : "",
  userId: user.telegramid,
  ownerName: ((user.first_name || "") + " " + (user.last_name || "")).trim() || "User",
  ownerUsername: user.username || "",
  status: "successful",
  timestamp: new Date().toISOString(),
  uniqueLink: uniqueLink
};

// Save to Database
Bot.setProperty("file_" + genFileId, fileRecord, "json");
Bot.setProperty("file_" + fileId, fileRecord, "json");
Bot.setProperty("file_" + uniqueId, fileRecord, "json");
Bot.setProperty(user.telegramid + "" + genFileId, fileRecord, "json");

// Save to userFiles (capped at 30)
var uFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
if (!Array.isArray(uFiles)) uFiles = [];
uFiles.unshift(fileRecord);
if (uFiles.length > 30) uFiles = uFiles.slice(0, 30);
Bot.setProperty("userFiles_" + user.telegramid, uFiles, "json");

// Update total counters
var totUp = (Bot.getProperty("total_uploads_count", 0) || 0) + 1;
Bot.setProperty("total_uploads_count", totUp, "integer");
var totSucc = (Bot.getProperty("total_successful_uploads", 0) || 0) + 1;
Bot.setProperty("total_successful_uploads", totSucc, "integer");

// Sync to User property for Traffic dashboard
try {
  var uList = User.getProperty("userFileList", []);
  if (!Array.isArray(uList)) { uList = []; }
  uList.unshift({
    file_unique_id: genFileId,
    file_name: fileName,
    file_type: fileType,
    uniqueLink: uniqueLink
  });
  if (uList.length > 30) {
    uList = uList.slice(0, 30);
  }
  User.setProperty("userFileList", uList, "json");
} catch (e) {}

// CASE 1: BULK UPLOAD MODE ACTIVE (Silent Upload!)
if (isBatchActive) {
  var bTemp = Bot.getProperty("batch_temp_" + user.telegramid, []);
  if (!Array.isArray(bTemp)) bTemp = [];
  bTemp.push(genFileId);
  Bot.setProperty("batch_temp_" + user.telegramid, bTemp, "json");

  // Save caption of first file as default batch caption if not set
  var existingBatchCap = Bot.getProperty("batch_caption_" + user.telegramid, "");
  if (!existingBatchCap && incomingCaption && incomingCaption.trim().length > 0) {
    Bot.setProperty("batch_caption_" + user.telegramid, incomingCaption.trim(), "string");
  }

  // SILENT: User when uploading in bulk should receive NO messages until they tap [✅ Done]!
  return;
}

// CASE 2: SINGLE UPLOAD MODE (Immediate Individual Delivery!)
// If user sends 1 file or multiple files simultaneously in single mode:
// Each file gets its own unique link and dashboard card immediately!
var captionDisplay = fileRecord.caption && fileRecord.caption.length > 0 ?
  ("📝 <b>Caption:</b>\n" + fileRecord.caption + "\n\n") : "";

var cardMsg = "✅ <b>File Uploaded Successfully!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>Name:</b> <code>" + escapeHtml(fileRecord.fileName) + "</code>\n" +
  "📊 <b>Size:</b> <code>" + escapeHtml(fileRecord.fileSize) + "</code>\n" +
  "🏷️ <b>Type:</b> <code>" + escapeHtml(fileRecord.fileType.toUpperCase()) + "</code>\n" +
  "📅 <b>Uploaded At:</b> <i>" + fileRecord.timestamp.slice(0, 19).replace('T', ' ') + "</i>\n\n" +
  captionDisplay +
  "🔗 <b>Unique Download Link:</b>\n" +
  "<code>" + escapeHtml(uniqueLink) + "</code>";

var cardButtons = [
  [
    { text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + fileRecord.fileName + ":"), style: "primary" }
  ],
  [
    { text: "✏️ Edit Caption", callback_data: "/editCaption " + genFileId, style: "primary" },
    { text: "📊 Download Traffic", callback_data: "/fileTraffic " + genFileId, style: "primary" }
  ],
  [
    { text: "❌ Delete File", callback_data: "/deleteFile " + genFileId, style: "primary" },
    { text: "🗂 My Files", callback_data: "/myfiles 1", style: "primary" }
  ]
];

Api.sendMessage({
  chat_id: targetChat,
  text: cardMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: cardButtons }
});
