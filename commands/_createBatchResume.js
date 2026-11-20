/*CMD
  command: /createBatchResume
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
var bTemp = Bot.getProperty("batch_temp_" + user.telegramid, []);
var bCount = bTemp ? bTemp.length : 0;
var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "➕ <b>Batch Mode Resumed!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📊 <b>Files in batch so far:</b> <b>" + bCount + "</b>\n\n" +
  "Send or forward more files now.\n" +
  "When you are finished, click <b>Done</b> below:";

var inlkey = [
  [
    { text: "✅ Done (" + bCount + " Files)", callback_data: "/batchDonePrompt", style: "primary" }
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
