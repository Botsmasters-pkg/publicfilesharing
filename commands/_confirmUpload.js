/*CMD
  command: /confirmUpload
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!user) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var draft = Bot.getProperty("temp_upload_" + user.telegramid);
var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!draft || !draft.fileId) {
  Api.sendMessage({
    chat_id: targetChat,
    text: "⚠️ <b>Upload session expired or no file found.</b>\nPlease send or forward your file again.",
    parse_mode: "HTML"
  });
  return;
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

// Generate brand-new unique ID every single upload
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
  telegramUniqueId: draft.uniqueId,
  fileId: draft.fileId,
  fileName: draft.fileName,
  fileSize: draft.fileSize,
  fileType: draft.fileType,
  mimeType: draft.mimeType,
  caption: draft.caption || "",
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
    var captionNote = draft.caption && draft.caption.length > 0 ?
      ("📝 <b>Caption:</b> " + escapeHtml(draft.caption) + "\n") : "";

    var storageCaption = "📦 <b>New Storage Backup</b>\n" +
      "<code>———————————————————————</code>\n" +
      "📁 <b>Name:</b> " + escapeHtml(draft.fileName) + "\n" +
      "📊 <b>Size:</b> " + escapeHtml(draft.fileSize) + "\n" +
      "🏷️ <b>Type:</b> " + escapeHtml(draft.fileType.toUpperCase()) + "\n" +
      captionNote +
      "👤 <b>Owner:</b> " + escapeHtml(uFull) + " (<code>" + user.telegramid + "</code> | " + escapeHtml(uHandle) + ")\n" +
      "🔗 <b>Link:</b> " + escapeHtml(uniqueLink);

    if (draft.fileType === "photo") {
      Api.sendPhoto({ chat_id: storageChannelId, photo: draft.fileId, caption: storageCaption, parse_mode: "HTML" });
    } else if (draft.fileType === "video") {
      Api.sendVideo({ chat_id: storageChannelId, video: draft.fileId, caption: storageCaption, parse_mode: "HTML" });
    } else if (draft.fileType === "audio" || draft.fileType === "voice") {
      Api.sendAudio({ chat_id: storageChannelId, audio: draft.fileId, caption: storageCaption, parse_mode: "HTML" });
    } else {
      Api.sendDocument({ chat_id: storageChannelId, document: draft.fileId, caption: storageCaption, parse_mode: "HTML" });
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
  Bot.setProperty("file_" + draft.fileId, uploadRecord, "json");
  Bot.setProperty("file_" + draft.uniqueId, uploadRecord, "json");
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
    file_name: draft.fileName,
    file_type: draft.fileType,
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
  Bot.setProperty(user.telegramid + "" + draft.uniqueId, uploadRecord, "json");
} catch (e) {}

// Clear draft and state
Bot.setProperty("temp_upload_" + user.telegramid, null);
Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

var keyb = [
  [{ text: "📂 View in My Files", callback_data: "/myfiles" }],
  [{ text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + draft.fileName + ":") }]
];

var finalCaptionDisplay = draft.caption && draft.caption.length > 0 ?
  ("📝 <b>Caption:</b> " + (draft.caption.length > 40 ? escapeHtml(draft.caption.slice(0, 40)) + "..." : escapeHtml(draft.caption)) + "\n") : "";

var successMsg = "✅ <b>Upload Successful!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>File Name:</b> <code>" + escapeHtml(draft.fileName) + "</code>\n" +
  "📊 <b>File Size:</b> <code>" + escapeHtml(draft.fileSize) + "</code>\n" +
  "📁 <b>File Type:</b> <code>" + escapeHtml(draft.fileType.toUpperCase()) + "</code>\n" +
  finalCaptionDisplay +
  "🏷️ <b>Storage Backup:</b> <code>Saved</code>\n\n" +
  "🔗 <b>Your Unique File Link:</b>\n" +
  "<code>" + escapeHtml(uniqueLink) + "</code>\n\n" +
  "<i>Anyone with this link can download your file!</i>";

if (request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: targetChat,
      message_id: request.message.message_id,
      text: successMsg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyb }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: targetChat,
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
