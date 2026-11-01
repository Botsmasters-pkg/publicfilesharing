/*CMD
  command: /shareFile
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
var botUsername = (Bot.getProperty("bot_username") || bot.name || "FileStoreToxicBot").replace("@", "");

var targetId = file ? (file.fileId || file.file_id || uniqueId) : uniqueId;
var shareLink = "https://t.me/" + botUsername + "?start=" + targetId;

var shareButton = [
  [{ text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(shareLink) + "&text=" + encodeURIComponent("Download this file from Telegram:") }]
];

Api.sendMessage({
  text:
    "*🔗 Shareable Link Generated!*\n`———————————————————————`\nAnyone with this link can download your file:\n\n`" +
    shareLink +
    "`",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: shareButton }
});
