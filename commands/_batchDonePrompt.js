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

if (!bTemp || bTemp.length === 0) {
  var emptyMsg = "⚠️ <b>No files added to batch yet!</b>\n\nPlease send or forward at least 1 file first before clicking Done.";
  var emptyKey = [
    [{ text: "❌ Cancel Batch", callback_data: "/cancelBatch", style: "primary" }]
  ];

  if (request && request.data && request.message) {
    try {
      Api.editMessageText({
        chat_id: chatId,
        message_id: request.message.message_id,
        text: emptyMsg,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: emptyKey }
      });
      return;
    } catch (e) {}
  }
  Api.sendMessage({
    chat_id: chatId,
    text: emptyMsg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: emptyKey }
  });
  return;
}

var currentCaption = Bot.getProperty("batch_caption_" + user.telegramid, "");

var captionSection = currentCaption && currentCaption.trim().length > 0 ?
  ("📝 <b>Batch Caption:</b>\n<blockquote>" + escapeHtml(currentCaption.trim()) + "</blockquote>\n") :
  ("📝 <b>Batch Caption:</b> <i>(No caption set - click Edit Caption to add one)</i>\n");

var promptMsg = "📦 <b>Batch Ready to Finalize!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📊 <b>Total Files Collected:</b> <b>" + bTemp.length + " files</b>\n\n" +
  captionSection + "\n" +
  "👉 <i>Caption yahi rakhna hai ya edit karna chahte hain?</i>\n" +
  "Click <b>Edit Caption</b> to change/write caption, or <b>Done & Generate Link</b> to finish:";

var inlkey = [
  [
    { text: "✏️ Edit Caption", callback_data: "/editBatchCaption", style: "primary" },
    { text: "✅ Done & Generate Link", callback_data: "/finishBatch", style: "primary" }
  ],
  [
    { text: "➕ Add More Files", callback_data: "/createBatchResume", style: "primary" },
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
