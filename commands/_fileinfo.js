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

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId) || Bot.getProperty(user.telegramid + "" + uniqueId);
if (!file) {
  Bot.sendMessage("⚠️ *File not found or expired.*", { parse_mode: "Markdown" });
  return;
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Strict User Ownership: Only owner or admin can inspect this file dashboard
if (file.userId && file.userId != user.telegramid && !isAdmin) {
  Bot.sendMessage("🚫 *Access Denied:* You do not own this file.", { parse_mode: "Markdown" });
  return;
}

var traffic = Bot.getProperty("traffic_" + uniqueId, { count: 0 });
var uniqueLink = file.uniqueLink || ("https://t.me/" + bot.name + "?start=" + uniqueId);
var fType = (file.fileType || file.mimeType || "document").toUpperCase();

var msg = "*🗂 File Dashboard*\n`———————————————————————`\n" +
  "📦 *Name:* `" + (file.fileName || "File") + "`\n" +
  "📊 *Size:* `" + (file.fileSize || "N/A") + "`\n" +
  "🏷️ *Type:* `" + fType + "`\n" +
  "📈 *Total Downloads:* *" + (traffic.count || 0) + "*\n" +
  "📅 *Uploaded At:* _" + (file.timestamp ? file.timestamp.slice(0, 19).replace('T', ' ') : "N/A") + "_\n\n" +
  "🔗 *Unique Download Link:*\n`" + uniqueLink + "`";

var inlkey = [
  [
    { text: "❌ Delete File", callback_data: "/deleteFile " + uniqueId },
    { text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + (file.fileName || "File") + ":") }
  ],
  [
    { text: "📊 Download Traffic (" + (traffic.count || 0) + ")", callback_data: "/fileTraffic " + uniqueId }
  ],
  [
    { text: "⬅️ Back to My Files", callback_data: "/myfiles" }
  ]
];

if (file.fileType === "photo") {
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: file.fileId || file.file_id,
    caption: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
} else if (file.fileType === "video") {
  Api.sendVideo({
    chat_id: user.telegramid,
    video: file.fileId || file.file_id,
    caption: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendDocument({
    chat_id: user.telegramid,
    document: file.fileId || file.file_id,
    caption: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
}
