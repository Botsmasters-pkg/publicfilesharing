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

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId) || Bot.getProperty(user.telegramid + "" + uniqueId);
var traffic = Bot.getProperty("traffic_" + uniqueId, { count: 0, downloaders: [] });

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Strict User Ownership & Privacy: Only file owner or admin can view this file's traffic
if (file && file.userId && file.userId != user.telegramid && !isAdmin) {
  Bot.sendMessage("🚫 *Access Denied:* You cannot view traffic for files you do not own.", { parse_mode: "Markdown" });
  return;
}

var fileName = (file && file.fileName) ? file.fileName : ("File " + uniqueId);
var totalDownloads = traffic.count || 0;
var downloaders = traffic.downloaders || [];

var txt = "📊 *Personal Download Traffic Report*\n`———————————————————————`\n" +
  "📦 *File:* `" + fileName + "`\n" +
  "📈 *Total Successful Downloads:* *" + totalDownloads + "*\n\n";

if (downloaders.length === 0) {
  txt += "_No one has downloaded this file yet._\n\nShare your Unique Link to get downloads!";
} else {
  txt += "*👥 Download History (Who Downloaded):*\n";
  // Display recent 30 downloaders
  var start = Math.max(0, downloaders.length - 30);
  for (var i = downloaders.length - 1; i >= start; i--) {
    var d = downloaders[i];
    var uName = d.username ? ("@" + d.username) : (d.name || "User");
    txt += "• *" + uName + "*\n";
    txt += "  └ ID: `#" + d.id + "` | 📅 _" + (d.date || "N/A") + "_\n";
  }
}

var backKey = [
  [{ text: "⬅️ Back to File", callback_data: "/fileinfo " + uniqueId }],
  [{ text: "📂 Back to My Files", callback_data: "/myfiles" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: txt,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: backKey }
  });
} else {
  Api.sendMessage({
    text: txt,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: backKey }
  });
}
