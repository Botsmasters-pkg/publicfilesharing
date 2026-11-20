/*CMD
  command: /cancelUpload
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

Bot.setProperty("temp_upload_" + user.telegramid, null);
Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

if (request.data && request.message) {
  try {
    Api.deleteMessage({
      chat_id: targetChat,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

Api.sendMessage({
  chat_id: targetChat,
  text: "❌ <b>Upload cancelled.</b>",
  parse_mode: "HTML"
});

Bot.runCommand("/showMenu");
