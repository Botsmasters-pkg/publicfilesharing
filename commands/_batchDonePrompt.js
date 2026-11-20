/*CMD
  command: /batchDonePrompt
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

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;
var bTemp = Bot.getProperty("batch_temp_" + user.telegramid, []);

var bulkKeyboard = [
  [{ text: "✅ Done", style: "primary" }],
  [{ text: "❌ Cancel Bulk Upload", style: "primary" }]
];

if (!bTemp || bTemp.length === 0) {
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Abhi tak koi file upload nahi hui hai!</b>\n\nPehle files bhejein, uske baad <b>Done</b> dabayein.",
    parse_mode: "HTML",
    reply_markup: { keyboard: bulkKeyboard, resize_keyboard: true }
  });
  return;
}

var currentCaption = Bot.getProperty("batch_caption_" + user.telegramid, "");

var captionSection = currentCaption && currentCaption.trim().length > 0 ?
  ("📝 <b>Current Caption:</b>\n<blockquote>" + escapeHtml(currentCaption.trim()) + "</blockquote>\n") :
  ("📝 <b>Current Caption:</b> <i>(No caption set)</i>\n");

var promptMsg = "📦 <b>Bulk Upload (" + bTemp.length + " Files) Ready!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📊 <b>Total Files Collected:</b> <b>" + bTemp.length + " files</b>\n\n" +
  captionSection + "\n" +
  "👉 <i>Caption edit karna chahte hain ya direct link generate karein?</i>\n" +
  "Agar caption likhna hai to <b>Edit Caption</b> dabayein, ya direct <b>Done & Generate Link</b> par click karein:";

var inlkey = [
  [
    { text: "✏️ Edit Caption", callback_data: "/editBatchCaption", style: "primary" },
    { text: "✅ Done & Generate Link", callback_data: "/finishBatch", style: "primary" }
  ],
  [
    { text: "❌ Cancel", callback_data: "/cancelBatch", style: "primary" }
  ]
];

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: promptMsg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlkey }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: promptMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
