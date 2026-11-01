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
var result = Bot.getProperty(user.telegramid + "" + uniqueId) || Bot.getProperty("file_" + uniqueId);
var traffic = Bot.getProperty("traffic_" + uniqueId, { count: 0, downloaders: [] });

var isAdmin = (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
var isOwner = (result && result.owner_id && result.owner_id == user.telegramid) || (!result) || isAdmin;

if (!isOwner) {
  Bot.sendMessage("🚫 *You are not authorized to view this file's traffic.*", { parse_mode: "Markdown" });
  return;
}

var fileName = (result && result.file_name) ? result.file_name : ("File " + uniqueId);
var totalDownloads = traffic.count || 0;
var downloaders = traffic.downloaders || [];

var txt = "📊 *Download Traffic Report*\n`———————————————————————`\n";
txt += "📦 *File:* `" + fileName + "`\n";
txt += "📈 *Total Downloads:* *" + totalDownloads + "*\n\n";

if (downloaders.length === 0) {
  txt += "_No users have downloaded this file yet._\n";
} else {
  txt += "*👥 Downloader Users (" + downloaders.length + "):*\n";
  var startIdx = Math.max(0, downloaders.length - 25);
  for (var i = downloaders.length - 1; i >= startIdx; i--) {
    var d = downloaders[i];
    var uName = d.username ? ("@" + d.username) : (d.name || "User");
    txt += "• " + uName + " (ID: `" + d.id + "`)";
    if (d.date) {
      txt += " - _" + d.date + "_";
    }
    txt += "\n";
  }
}

var backKey = [
  [
    {
      text: "⬅️ Back to File",
      callback_data: "/fileinfo " + uniqueId
    }
  ]
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

