/*CMD
  command: /downloadDirect
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

var targetId = params.trim();
var file = Bot.getProperty("file_" + targetId);
if (!file) {
  var id = targetId.slice(0, 10);
  var fil = targetId.slice(10, 40);
  file = Bot.getProperty(id + "" + fil) || Bot.getProperty(targetId);
}

// targetFileId is either from database record or targetId directly (Telegram File ID)
var targetFileId = (file && (file.fileId || file.file_id)) ? (file.fileId || file.file_id) : targetId;
var targetUniqueId = (file && (file.fileUniqueId || file.file_unique_id)) ? (file.fileUniqueId || file.file_unique_id) : targetId;
var targetFileName = (file && (file.fileName || file.file_name)) ? (file.fileName || file.file_name) : "File";
var targetFileType = (file && file.fileType) ? file.fileType : "document";

// Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";
var uHandle = user.username ? ("@" + user.username) : "";

// Log unique download traffic for file owner (No duplicate user records!)
var trafficKey = targetUniqueId;
var traffic = Bot.getProperty("traffic_" + trafficKey, { count: 0, downloaders: [] });
if (!traffic || typeof traffic !== "object") { traffic = { count: 0, downloaders: [] }; }
traffic.downloaders = traffic.downloaders || [];

var cleanDownloaders = [];
var seenIds = {};
var alreadyDownloaded = false;
var now = new Date().toISOString().slice(0, 19).replace("T", " ");

for (var k = 0; k < traffic.downloaders.length; k++) {
  var entry = traffic.downloaders[k];
  if (entry && entry.id) {
    if (!seenIds[entry.id]) {
      seenIds[entry.id] = true;
      if (entry.id == user.telegramid) {
        alreadyDownloaded = true;
        entry.date = now;
        entry.name = uFull;
        entry.username = user.username || "";
      }
      cleanDownloaders.push(entry);
    }
  }
}
traffic.downloaders = cleanDownloaders;

if (!alreadyDownloaded) {
  traffic.downloaders.push({
    id: user.telegramid,
    name: uFull,
    username: user.username || "",
    date: now
  });
}
if (traffic.downloaders.length > 50) {
  traffic.downloaders = traffic.downloaders.slice(-50);
}
traffic.count = traffic.downloaders.length;

try {
  Bot.setProperty("traffic_" + trafficKey, traffic, "json");
  if (targetId !== trafficKey) {
    Bot.setProperty("traffic_" + targetId, traffic, "json");
  }
} catch (e) {}

// Save to global downloadLogs for stats and CSV export
var totalDownloads = (Bot.getProperty("total_downloads_count", 0) || 0) + 1;
Bot.setProperty("total_downloads_count", totalDownloads, "integer");

var downloadLogs = Bot.getProperty("downloadLogs", []);
if (!Array.isArray(downloadLogs)) { downloadLogs = []; }
downloadLogs.push({
  fileId: (file && file.id) ? file.id : 0,
  fileUniqueId: targetUniqueId,
  downloaderId: user.telegramid,
  downloaderName: uFull,
  downloaderUsername: user.username || "",
  timestamp: new Date().toISOString()
});
if (downloadLogs.length > 30) {
  downloadLogs = downloadLogs.slice(-30);
}
try {
  Bot.setProperty("downloadLogs", downloadLogs, "json");
} catch (e) {}

var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");

// Send File according to media type with balanced HTML and fallback
var rawFileCap = (file && file.caption && file.caption.trim() !== "") ? file.caption.trim() : "";
var cleanCaption = balanceTelegramHtml(rawFileCap, true);

var caption = "";
if (cleanCaption) {
  caption += cleanCaption + "\n\n<code>———————————————————————</code>\n";
}
caption += "📦 <b>Name:</b> <code>" + escapeHtml(targetFileName) + "</code>\n" +
  (file && file.fileSize ? ("📊 <b>Size:</b> " + escapeHtml(file.fileSize) + "\n\n") : "\n") +
  "🤖 <i>Downloaded via <a href=\"https://t.me/" + escapeHtml(botUsername) + "\">@" + escapeHtml(botUsername) + "</a></i>";

caption = balanceTelegramHtml(caption, true);

function sendMediaWithFallback(type, p) {
  try {
    if (type === "photo") {
      Api.sendPhoto(p);
    } else if (type === "video") {
      Api.sendVideo(p);
    } else if (type === "audio" || type === "voice") {
      Api.sendAudio(p);
    } else {
      Api.sendDocument(p);
    }
  } catch (err) {
    // Fallback: If Telegram rejects HTML formatting in caption, send with plain caption so user ALWAYS receives the file!
    try {
      var plainParams = {};
      for (var k in p) {
        if (p.hasOwnProperty(k)) plainParams[k] = p[k];
      }
      delete plainParams.parse_mode;
      if (plainParams.caption) {
        plainParams.caption = plainParams.caption.replace(/<[^>]+>/g, "");
      }
      if (type === "photo") {
        Api.sendPhoto(plainParams);
      } else if (type === "video") {
        Api.sendVideo(plainParams);
      } else if (type === "audio" || type === "voice") {
        Api.sendAudio(plainParams);
      } else {
        Api.sendDocument(plainParams);
      }
    } catch (e2) {}
  }
}

if (targetFileType === "photo") {
  sendMediaWithFallback("photo", { chat_id: user.telegramid, photo: targetFileId, caption: caption, parse_mode: "HTML" });
} else if (targetFileType === "video") {
  sendMediaWithFallback("video", { chat_id: user.telegramid, video: targetFileId, caption: caption, parse_mode: "HTML" });
} else if (targetFileType === "audio" || targetFileType === "voice") {
  sendMediaWithFallback("audio", { chat_id: user.telegramid, audio: targetFileId, caption: caption, parse_mode: "HTML" });
} else {
  sendMediaWithFallback("document", { chat_id: user.telegramid, document: targetFileId, caption: caption, parse_mode: "HTML" });
}
