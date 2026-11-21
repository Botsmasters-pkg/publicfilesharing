/*CMD
  command: /editCaption
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!user) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;
var targetId = params ? params.trim() : "";

var fileObj = targetId ? (Bot.getProperty("file_" + targetId) || Bot.getProperty(user.telegramid + "" + targetId)) : null;
var currCap = (fileObj && fileObj.caption) ? fileObj.caption : "None";

Bot.setProperty("user_caption_state_" + user.telegramid, "waiting_new_caption", "string");
Bot.setProperty("caption_target_file_" + user.telegramid, targetId, "string");

var txt = "✏️ <b>Edit File Caption</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  (fileObj ? ("📁 <b>File:</b> <code>" + escapeHtml(fileObj.fileName || fileObj.file_name || "File") + "</code>\n") : "") +
  "<b>Current Caption:</b>\n<blockquote>" + (currCap === "None" ? "None" : currCap) + "</blockquote>\n\n" +
  "👉 <b>Apna naya caption neeche text message me likhkar bhejein:</b>\n\n" +
  "💡 <i>Tips: Aap Telegram me text select karke link laga sakte hain, ya markdown format likh sakte hain:</i>\n" +
  "<code>Setup must watch - [click here](https://t.me/example)</code>\n\n" +
  "<i>(Cancel karne ke liye '❌ Cancel' likhein)</i>";

Api.sendMessage({
  chat_id: targetChat,
  text: txt,
  parse_mode: "HTML"
});
