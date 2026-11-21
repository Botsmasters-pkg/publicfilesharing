/*CMD
  command: /adminWelcome
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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Bot.setProperty("admin_state_" + user.telegramid, "waiting_welcome", "string");

var wm = Bot.getProperty("welcomeMessage", {
  type: "text",
  text: "Default Welcome Message",
  media: "",
  caption: ""
});

var msg = "👋 <b>Custom Welcome Message Settings</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Type:</b> <code>" + escapeHtml((wm.type || "text").toUpperCase()) + "</code>\n" +
  "• <b>Content:</b> " + escapeHtml(wm.text || wm.caption || "Default") + "\n\n" +
  "👉 <b>How to customize:</b>\n" +
  "• Send <b>Text</b> in chat to set as Welcome Text.\n" +
  "• Send a <b>Photo</b> (with optional caption) to set as Welcome Photo.\n" +
  "• Send a <b>Video</b> (with optional caption) to set as Welcome Video.";

var keyb = [
  [{ text: "🔄 Reset to Default Welcome", callback_data: "/clearWelcome", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin", style: "primary" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
}
