/*CMD
  command: /cancelBatch
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

Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
Bot.setProperty("batch_temp_" + user.telegramid, [], "json");

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "❌ <b>Batch creation cancelled.</b>\n\nNo batch link was generated.";

var inlkey = [
  [
    { text: "📦 Create New Batch", callback_data: "/createBatch", style: "primary" },
    { text: "📂 Go to My Files", callback_data: "/myfiles 1", style: "primary" }
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
