/*CMD
  command: /fileinfo
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

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId) || Bot.getProperty(user.telegramid + "" + uniqueId);
if (!file) {
  Api.sendMessage({
    text: "⚠️ <b>File not found or expired.</b>",
    parse_mode: "HTML"
  });
  return;
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Strict User Ownership: Only owner or admin can inspect this file dashboard
if (file.userId && file.userId != user.telegramid && !isAdmin) {
  Api.sendMessage({
    text: "🚫 <b>Access Denied:</b> You do not own this file.",
    parse_mode: "HTML"
  });
  return;
}

var traffic = Bot.getProperty("traffic_" + uniqueId, { count: 0 });
var botUsername = (Bot.getProperty("bot_username") || bot.name || "FileStoreToxicBot").replace("@", "");
var targetFileId = file.fileId || file.file_id || uniqueId;
var uniqueLink = file.uniqueLink || ("https://t.me/" + botUsername + "?start=" + uniqueId);
var fType = (file.fileType || file.mimeType || "document").toUpperCase();

var msg = "🗂 <b>File Dashboard</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>Name:</b> <code>" + escapeHtml(file.fileName || "File") + "</code>\n" +
  "📊 <b>Size:</b> <code>" + escapeHtml(file.fileSize || "N/A") + "</code>\n" +
  "🏷️ <b>Type:</b> <code>" + escapeHtml(fType) + "</code>\n" +
  "📈 <b>Total Downloads:</b> <b>" + (traffic.count || 0) + "</b>\n" +
  "📅 <b>Uploaded At:</b> <i>" + escapeHtml(file.timestamp ? file.timestamp.slice(0, 19).replace('T', ' ') : "N/A") + "</i>\n\n" +
  "🔗 <b>Unique Download Link:</b>\n" +
  "<code>" + escapeHtml(uniqueLink) + "</code>";

var inlkey = [
  [
    { text: "❌ Delete File", callback_data: "/deleteFile " + uniqueId, style: "primary" },
    { text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + (file.fileName || "File") + ":"), style: "primary" }
  ],
  [
    { text: "📊 Download Traffic (" + (traffic.count || 0) + ")", callback_data: "/fileTraffic " + uniqueId, style: "primary" }
  ],
  [
    { text: "⬅️ Back to My Files", callback_data: "/myfiles", style: "primary" }
  ]
];

if (file.fileType === "photo") {
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: targetFileId,
    caption: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
} else if (file.fileType === "video") {
  Api.sendVideo({
    chat_id: user.telegramid,
    video: targetFileId,
    caption: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendDocument({
    chat_id: user.telegramid,
    document: targetFileId,
    caption: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
}
