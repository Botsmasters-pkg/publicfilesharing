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
Bot.setProperty("batch_caption_" + user.telegramid, "", "string");
Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "📦 <b>Batch Mode: ACTIVE</b>\n" +
  "<code>———————————————————————</code>\n" +
  "Send or forward all the files (Photos, Videos, Documents, Audio) you want in this batch.\n\n" +
  "📊 <b>Files Added:</b> <b>0</b>\n\n" +
  "👉 <i>Aap ek sath 5, 10 ya kitni bhi files bhej sakte hain.\n" +
  "Sabhi files bhejne ke baad neeche <b>Done</b> par click karein:</i>";

var inlkey = [
  [
    { text: "✅ Done (0 Files)", callback_data: "/batchDonePrompt", style: "primary" }
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
    Bot.setProperty("batch_msg_id_" + user.telegramid, request.message.message_id, "integer");
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
