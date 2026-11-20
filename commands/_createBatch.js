/*CMD
  command: /createBatch
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

Bot.setProperty("user_batch_state_" + user.telegramid, "active", "string");
Bot.setProperty("batch_temp_" + user.telegramid, [], "json");

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "📦 <b>Batch Link Creator Mode: ACTIVE</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "You can now send or forward multiple files (Photos, Videos, Documents, Audio) one by one!\n\n" +
  "📊 <b>Files in this batch:</b> <b>0</b>\n\n" +
  "👉 <i>Send your files now. When you have sent all files, click <b>✅ Finish & Generate Batch Link</b> below:</i>";

var inlkey = [
  [
    { text: "✅ Finish & Generate Link (0)", callback_data: "/finishBatch", style: "primary" }
  ],
  [
    { text: "❌ Cancel Batch", callback_data: "/cancelBatch", style: "primary" }
  ]
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
