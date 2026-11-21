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

function balanceTelegramHtml(html, isMedia) {
  if (!html) return "";
  var str = html.toString();
  if (isMedia) {
    str = str.replace(/<\/?(?:blockquote|expandable_blockquote)[^>]*>/gi, "");
  }
  var tagRegex = /<\/?([a-z0-9_-]+)(?:\s+[^>]*)?>/gi;
  var result = "";
  var lastIndex = 0;
  var stack = [];
  var match;
  var allowedTags = isMedia 
    ? ["b", "strong", "i", "em", "u", "ins", "s", "strike", "del", "code", "pre", "tg-spoiler", "a"]
    : ["b", "strong", "i", "em", "u", "ins", "s", "strike", "del", "code", "pre", "tg-spoiler", "a", "blockquote", "expandable_blockquote"];

  while ((match = tagRegex.exec(str)) !== null) {
    var fullTag = match[0];
    var tagName = match[1].toLowerCase();
    var isClose = fullTag.charAt(1) === '/';

    result += str.slice(lastIndex, match.index);
    lastIndex = tagRegex.lastIndex;

    if (allowedTags.indexOf(tagName) === -1) {
      continue;
    }

    if (!isClose) {
      stack.push(tagName);
      result += fullTag;
    } else {
      var stackIdx = stack.lastIndexOf(tagName);
      if (stackIdx !== -1) {
        while (stack.length - 1 > stackIdx) {
          var unclosed = stack.pop();
          result += "</" + unclosed + ">";
        }
        stack.pop();
        result += "</" + tagName + ">";
      }
    }
  }

  result += str.slice(lastIndex);
  while (stack.length > 0) {
    var rem = stack.pop();
    result += "</" + rem + ">";
  }
  return result;
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

var bTraffic = Bot.getProperty("traffic_" + batchId, { count: 0, downloaders: [] });
var bDlCount = (bTraffic.downloaders && bTraffic.downloaders.length > 0) ? (function() {
  var s = {}; var c = 0;
  for (var bi = 0; bi < bTraffic.downloaders.length; bi++) {
    if (bTraffic.downloaders[bi] && bTraffic.downloaders[bi].id && !s[bTraffic.downloaders[bi].id]) {
      s[bTraffic.downloaders[bi].id] = true; c++;
    }
  }
  return c;
})() : (bTraffic.count || 0);

var cleanCaption = balanceTelegramHtml(batchObj.caption, false);
var captionDisplay = (cleanCaption && cleanCaption.trim().length > 0) ?
  ("\n📝 <b>Caption:</b>\n" + cleanCaption.trim()) : "";

var msg = "📦 <b>Batch Dashboard</b>\n" +
  "<code>———————————————————————</code>\n" +
  "🆔 <b>Batch ID:</b> <code>" + escapeHtml(batchObj.batchId) + "</code>\n" +
  "📁 <b>Total Files:</b> <b>" + (batchObj.count || (batchObj.fileIds ? batchObj.fileIds.length : 0)) + "</b>\n" +
  "📈 <b>Unique Downloads:</b> <b>" + bDlCount + "</b>\n" +
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
  } catch (e) {
    try {
      var plainMsg = msg.replace(/<[^>]+>/g, "");
      Api.editMessageText({
        chat_id: chatId,
        message_id: request.message.message_id,
        text: plainMsg,
        reply_markup: { inline_keyboard: inlkey }
      });
      return;
    } catch (e2) {}
  }
}

try {
  Api.sendMessage({
    chat_id: chatId,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
} catch (e3) {
  var plainMsg2 = msg.replace(/<[^>]+>/g, "");
  Api.sendMessage({
    chat_id: chatId,
    text: plainMsg2,
    reply_markup: { inline_keyboard: inlkey }
  });
}
