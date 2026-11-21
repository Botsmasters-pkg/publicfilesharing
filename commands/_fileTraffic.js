/*CMD
  command: /fileTraffic
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
var traffic = Bot.getProperty("traffic_" + uniqueId, { count: 0, downloaders: [] });

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Strict User Ownership & Privacy: Only file owner or admin can view this file's traffic
if (file && file.userId && file.userId != user.telegramid && !isAdmin) {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: "🚫 <b>Access Denied:</b> You cannot view traffic for files you do not own.",
    parse_mode: "HTML"
  });
  return;
}

var fileName = (file && file.fileName) ? file.fileName : ("File " + uniqueId);

// Deduplicate downloaders to ensure every user ID appears exactly once
var rawDownloaders = traffic.downloaders || [];
var uniqueDownloaders = [];
var seenUsers = {};

for (var k = 0; k < rawDownloaders.length; k++) {
  var dEntry = rawDownloaders[k];
  if (dEntry && dEntry.id && !seenUsers[dEntry.id]) {
    seenUsers[dEntry.id] = true;
    uniqueDownloaders.push(dEntry);
  }
}

// Auto-clean database if older repeated entries existed
if (rawDownloaders.length !== uniqueDownloaders.length) {
  traffic.downloaders = uniqueDownloaders;
  traffic.count = uniqueDownloaders.length;
  try {
    Bot.setProperty("traffic_" + uniqueId, traffic, "json");
  } catch (e) {}
}

var downloaders = uniqueDownloaders;
var totalDownloads = downloaders.length;

var txt = "📊 <b>Personal Download Traffic Report</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>File:</b> <code>" + escapeHtml(fileName) + "</code>\n" +
  "📈 <b>Unique Downloads:</b> <b>" + totalDownloads + " users</b>\n\n";

if (downloaders.length === 0) {
  txt += "<i>No one has downloaded this file yet.</i>\n\nShare your Unique Link to get downloads!";
} else {
  txt += "<b>👥 Unique Downloaders:</b>\n";
  var start = Math.max(0, downloaders.length - 30);
  for (var i = downloaders.length - 1; i >= start; i--) {
    var d = downloaders[i];
    var uName = d.username ? ("@" + d.username) : (d.name || "User");
    txt += "• <b>" + escapeHtml(uName) + "</b>\n";
    txt += "  └ ID: <code>#" + d.id + "</code> | 📅 <i>" + escapeHtml(d.date || "N/A") + "</i>\n";
  }
}

var backKey = [
  [{ text: "⬅️ Back to File", callback_data: "/fileinfo " + uniqueId, style: "primary" }],
  [{ text: "📂 Back to My Files", callback_data: "/myfiles", style: "primary" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: backKey }
  });
} else {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: backKey }
  });
}
