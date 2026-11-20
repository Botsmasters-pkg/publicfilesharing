/*CMD
  command: /editBatchCaption
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

Bot.setProperty("user_batch_caption_state_" + user.telegramid, "waiting_batch_caption", "string");

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "✏️ <b>Enter Bulk Upload Caption / Description</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Send the text, title, or caption you want to attach to this bulk upload.\n\n" +
  "<i>Example:</i> <code>Mirzapur Season 3 [All Episodes Complete 720p]</code>\n\n" +
  "👉 <b>Send your text now in chat:</b>\n" +
  "<i>(Ya skip/cancel karke bina caption link generate karne ke liye neeche click karein)</i>";

var inlkey = [
  [{ text: "⏩ Skip & Generate Link", callback_data: "/finishBatch", style: "primary" }]
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
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
