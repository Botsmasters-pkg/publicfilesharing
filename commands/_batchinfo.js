/*CMD
  command: /batchinfo
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

var batchId = params.trim();
var batchObj = Bot.getProperty("batch_" + batchId);
var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!batchObj) {
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Batch not found or expired.</b>",
    parse_mode: "HTML"
  });
  return;
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (batchObj.userId && batchObj.userId != user.telegramid && !isAdmin) {
  Api.sendMessage({
    chat_id: chatId,
    text: "🚫 <b>Access Denied:</b> You do not own this batch.",
    parse_mode: "HTML"
  });
  return;
}

var bTraffic = Bot.getProperty("traffic_" + batchId, { count: 0 });

var captionDisplay = (batchObj.caption && batchObj.caption.trim().length > 0) ?
  ("\n📝 <b>Caption:</b>\n<blockquote>" + batchObj.caption.trim() + "</blockquote>") : "";

var msg = "📦 <b>Batch Dashboard</b>\n" +
  "<code>———————————————————————</code>\n" +
  "🆔 <b>Batch ID:</b> <code>" + escapeHtml(batchObj.batchId) + "</code>\n" +
  "📁 <b>Total Files:</b> <b>" + (batchObj.count || (batchObj.fileIds ? batchObj.fileIds.length : 0)) + "</b>\n" +
  "📈 <b>Total Downloads:</b> <b>" + (bTraffic.count || 0) + "</b>\n" +
  "📅 <b>Created At:</b> <i>" + escapeHtml(batchObj.timestamp ? batchObj.timestamp.slice(0, 19).replace('T', ' ') : "N/A") + "</i>" + captionDisplay + "\n\n" +
  "<b>📄 Files in this Batch:</b>\n";

if (batchObj.fileIds && batchObj.fileIds.length > 0) {
  for (var i = 0; i < batchObj.fileIds.length; i++) {
    var fKey = batchObj.fileIds[i];
    var f = Bot.getProperty("file_" + fKey);
    var fName = f ? (f.fileName || f.file_name || "File") : "File " + (i + 1);
    var fSize = f ? (f.fileSize || "N/A") : "N/A";
    msg += "• " + (i + 1) + ". <code>" + escapeHtml(fName) + "</code> (" + escapeHtml(fSize) + ")\n";
  }
}

msg += "\n🔗 <b>Batch Download Link:</b>\n" +
  "<code>" + escapeHtml(batchObj.uniqueLink) + "</code>";

var inlkey = [
  [
    { text: "❌ Delete Batch", callback_data: "/deleteBatch " + batchId, style: "primary" },
    { text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(batchObj.uniqueLink) + "&text=" + encodeURIComponent("Download " + (batchObj.count || "") + " files batch:"), style: "primary" }
  ],
  [
    { text: "📥 Download Batch", callback_data: "/downloadBatch " + batchId, style: "primary" },
    { text: "⬅️ Back to Batches", callback_data: "/mybatches", style: "primary" }
  ]
];

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: msg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlkey }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
