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

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId) || Bot.getProperty(user.telegramid + "" + uniqueId);
var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");

var shareLink = (file && file.uniqueLink) ? file.uniqueLink : ("https://t.me/" + botUsername + "?start=" + uniqueId);

var shareButton = [
  [{ text: "📤 Share Link", url: "https://t.me/share/url?url=" + encodeURIComponent(shareLink) + "&text=" + encodeURIComponent("Download this file from Telegram:"), style: "primary" }]
];

Api.sendMessage({
  text: "<b>🔗 Shareable Link Generated!</b>\n" +
    "<code>———————————————————————</code>\n" +
    "Anyone with this link can download your file:\n\n" +
    "<code>" + escapeHtml(shareLink) + "</code>",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: shareButton }
});
