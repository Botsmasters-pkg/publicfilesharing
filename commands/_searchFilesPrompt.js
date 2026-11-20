/*CMD
  command: /searchFilesPrompt
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

Bot.setProperty("user_search_state_" + user.telegramid, "waiting_search", "string");

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "🔍 <b>Search Your Files</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Send the file name, extension, or keyword you want to search:\n\n" +
  "<i>Example:</i> <code>C++</code>, <code>Assignment</code>, <code>pdf</code>, <code>video</code>\n\n" +
  "👉 Or click Cancel below to return to your files.";

var cancelKey = [
  [{ text: "❌ Cancel Search", callback_data: "/myfiles 1", style: "primary" }]
];

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: msg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: cancelKey }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: cancelKey }
});
