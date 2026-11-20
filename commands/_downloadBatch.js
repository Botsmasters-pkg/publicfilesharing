/*CMD
  command: /downloadBatch
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

if (!batchObj || !batchObj.fileIds || batchObj.fileIds.length === 0) {
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Batch link not found or expired.</b>",
    parse_mode: "HTML"
  });
  return;
}

// User Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";

// Track download traffic for batch
var bTraffic = Bot.getProperty("traffic_" + batchId, { count: 0, downloaders: [] });
bTraffic.count = (bTraffic.count || 0) + 1;
bTraffic.downloaders = bTraffic.downloaders || [];
bTraffic.downloaders.push({
  id: user.telegramid,
  name: uFull,
  username: user.username || "",
  date: new Date().toISOString().slice(0, 19).replace("T", " ")
});
if (bTraffic.downloaders.length > 30) {
  bTraffic.downloaders = bTraffic.downloaders.slice(-30);
}
try {
  Bot.setProperty("traffic_" + batchId, bTraffic, "json");
} catch (e) {}

// Increment global download count
var totalD = (Bot.getProperty("total_downloads_count", 0) || 0) + batchObj.fileIds.length;
Bot.setProperty("total_downloads_count", totalD, "integer");

var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");

var capHeader = (batchObj.caption && batchObj.caption.trim().length > 0) ?
  ("📝 <b>" + escapeHtml(batchObj.caption.trim()) + "</b>\n\n") : "";

// Send banner
Api.sendMessage({
  chat_id: chatId,
  text: "📦 <b>Sending Batch Files (Total: " + batchObj.fileIds.length + ")</b>\n" +
    "<code>———————————————————————</code>\n" +
    capHeader +
    "<i>Please wait while all files are being delivered to your chat...</i>",
  parse_mode: "HTML"
});

// Send each file in the batch
for (var i = 0; i < batchObj.fileIds.length; i++) {
  var fKey = batchObj.fileIds[i];
  var file = Bot.getProperty("file_" + fKey);
  if (!file) continue;

  var targetFileId = file.fileId || file.file_id || fKey;
  var targetFileName = file.fileName || file.file_name || ("File " + (i + 1));
  var targetFileType = file.fileType || "document";

  var caption = "";
  if (file.caption && file.caption.trim() !== "") {
    caption += escapeHtml(file.caption.trim()) + "\n\n<code>———————————————————————</code>\n";
  }
  caption += "📦 <b>Name:</b> <code>" + escapeHtml(targetFileName) + "</code> (" + (i + 1) + "/" + batchObj.fileIds.length + ")\n" +
    (file.fileSize ? ("📊 <b>Size:</b> " + escapeHtml(file.fileSize) + "\n\n") : "\n") +
    "🤖 <i>Downloaded via <a href=\"https://t.me/" + escapeHtml(botUsername) + "\">@" + escapeHtml(botUsername) + "</a></i>";

  try {
    if (targetFileType === "photo") {
      Api.sendPhoto({ chat_id: user.telegramid, photo: targetFileId, caption: caption, parse_mode: "HTML" });
    } else if (targetFileType === "video") {
      Api.sendVideo({ chat_id: user.telegramid, video: targetFileId, caption: caption, parse_mode: "HTML" });
    } else if (targetFileType === "audio" || targetFileType === "voice") {
      Api.sendAudio({ chat_id: user.telegramid, audio: targetFileId, caption: caption, parse_mode: "HTML" });
    } else {
      Api.sendDocument({ chat_id: user.telegramid, document: targetFileId, caption: caption, parse_mode: "HTML" });
    }
  } catch (err) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: "✅ <b>All " + batchObj.fileIds.length + " files from batch delivered successfully!</b>",
  parse_mode: "HTML"
});
