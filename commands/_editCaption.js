/*CMD
  command: /editCaption
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

var draft = Bot.getProperty("temp_upload_" + user.telegramid);
var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!draft) {
  Api.sendMessage({
    chat_id: targetChat,
    text: "⚠️ <b>No active upload found.</b> Please send or forward your file again.",
    parse_mode: "HTML"
  });
  return;
}

Bot.setProperty("user_caption_state_" + user.telegramid, "waiting_new_caption", "string");

var currCap = (draft && draft.caption && draft.caption.trim() !== "") ? draft.caption : "None";

var txt = "✏️ <b>Edit File Caption</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "<b>Current Caption:</b>\n<blockquote>" + escapeHtml(currCap) + "</blockquote>\n\n" +
  "👉 <b>Apna naya caption neeche text message ke roop me bhejein:</b>\n\n" +
  "<i>(Ya neeche diye gaye button par click karke purana caption hi rakh sakte hain)</i>";

var keyb = [
  [{ text: "⬅️ Cancel & Keep Current", callback_data: "/keepCaption" }]
];

if (request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: targetChat,
      message_id: request.message.message_id,
      text: txt,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyb }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: targetChat,
  text: txt,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
