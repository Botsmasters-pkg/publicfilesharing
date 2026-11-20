/*CMD
  command: /keepCaption
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

Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

var draft = Bot.getProperty("temp_upload_" + user.telegramid);
var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!draft) {
  Bot.runCommand("/showMenu");
  return;
}

var captionBox = draft.caption && draft.caption.trim() !== "" ?
  ("📝 <b>Current Caption:</b>\n<blockquote>" + escapeHtml(draft.caption) + "</blockquote>\n") :
  ("📝 <b>Current Caption:</b> <i>(No caption attached)</i>\n");

var previewMsg = "📦 <b>File Ready for Upload!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📁 <b>Name:</b> <code>" + escapeHtml(draft.fileName) + "</code>\n" +
  "📊 <b>Size:</b> <code>" + escapeHtml(draft.fileSize) + "</code>\n" +
  "🏷️ <b>Type:</b> <code>" + escapeHtml(draft.fileType.toUpperCase()) + "</code>\n\n" +
  captionBox + "\n" +
  "👉 <i>Caption yahi rakhna hai ya edit karna chahte hain?</i>\n" +
  "Click <b>Done & Upload</b> to proceed, or <b>Edit Caption</b> to change it:";

var keyb = [
  [
    { text: "✏️ Edit Caption", callback_data: "/editCaption" },
    { text: "✅ Done & Upload", callback_data: "/confirmUpload" }
  ],
  [
    { text: "❌ Cancel", callback_data: "/cancelUpload" }
  ]
];

if (request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: targetChat,
      message_id: request.message.message_id,
      text: previewMsg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyb }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: targetChat,
  text: previewMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
