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

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId) || Bot.getProperty(user.telegramid + "" + uniqueId);
if (!file) {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
    text: "⚠️ <b>File not found or expired.</b>",
    parse_mode: "HTML"
  });
  return;
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Strict User Ownership: Only owner or admin can inspect this file dashboard
if (file.userId && file.userId != user.telegramid && !isAdmin) {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
    text: "🚫 <b>Access Denied:</b> You do not own this file.",
    parse_mode: "HTML"
  });
  return;
}

var traffic = Bot.getProperty("traffic_" + uniqueId, { count: 0, downloaders: [] });
var dlCount = (traffic.downloaders && traffic.downloaders.length > 0) ? (function() {
  var s = {}; var c = 0;
  for (var i = 0; i < traffic.downloaders.length; i++) {
    if (traffic.downloaders[i] && traffic.downloaders[i].id && !s[traffic.downloaders[i].id]) {
      s[traffic.downloaders[i].id] = true; c++;
    }
  }
  return c;
})() : (traffic.count || 0);
var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");
var targetFileId = file.fileId || file.file_id || uniqueId;
var uniqueLink = file.uniqueLink || ("https://t.me/" + botUsername + "?start=" + uniqueId);
var fType = (file.fileType || file.mimeType || "document").toUpperCase();

var cleanCaption = balanceTelegramHtml(file.caption, false);
var captionDisplay = (cleanCaption && cleanCaption.trim() !== "") ?
  ("\n\n📝 <b>Caption:</b>\n" + cleanCaption.trim()) : "";

var msg = "🗂 <b>File Dashboard</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>Name:</b> <code>" + escapeHtml(file.fileName || "File") + "</code>\n" +
  "📊 <b>Size:</b> <code>" + escapeHtml(file.fileSize || "N/A") + "</code>\n" +
  "🏷️ <b>Type:</b> <code>" + escapeHtml(fType) + "</code>\n" +
  "📈 <b>Unique Downloads:</b> <b>" + dlCount + "</b>\n" +
  "📅 <b>Uploaded At:</b> <i>" + escapeHtml(file.timestamp ? file.timestamp.slice(0, 19).replace('T', ' ') : "N/A") + "</i>" + captionDisplay + "\n\n" +
  "🔗 <b>Unique Download Link:</b>\n" +
  "<code>" + escapeHtml(uniqueLink) + "</code>";

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null);

var inlkey = [
  [
    { text: "❌ Delete File", callback_data: "/deleteFile " + uniqueId, style: "primary" },
    { text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(uniqueLink) + "&text=" + encodeURIComponent("Download " + (file.fileName || "File") + ":"), style: "primary" }
  ],
  [
    { text: "📥 Download File", callback_data: "/downloadDirect " + uniqueId, style: "primary" },
    { text: "📊 Download Traffic (" + dlCount + ")", callback_data: "/fileTraffic " + uniqueId, style: "primary" }
  ],
  [
    { text: "⬅️ Back to My Files", callback_data: "/myfiles", style: "primary" }
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
