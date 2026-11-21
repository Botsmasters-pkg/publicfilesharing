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

var bulkKeyboard = [
  [
    { text: "✅ Done", style: "primary" },
    { text: "❌ Cancel", style: "primary" }
  ]
];

var msg = "📦 <b>Bulk Upload Mode: ACTIVE</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Aap ab apni sabhi files (Photos, Videos, Documents, Audio) bhej ya forward kar sakte hain.\n\n" +
  "🤫 <i>Files upload karte samay bot shant rahega (Silent Upload).\n" +
  "👉 <b>Sabhi files bhej lene ke baad neeche diye gaye '✅ Done' button par click karein!</b></i>";

if (request && request.data && request.message) {
  try {
    Api.deleteMessage({
      chat_id: chatId,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: bulkKeyboard, resize_keyboard: true }
});
