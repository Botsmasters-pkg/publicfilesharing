/*CMD
  command: /adminSupport
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

Bot.setProperty("admin_state_" + user.telegramid, "waiting_support", "string");

var sup = Bot.getProperty("supportContact", {
  username: "botadminshere",
  link: "https://t.me/botadminshere"
});

var msg = "🆘 <b>Support Contact Settings</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Current Support Username:</b> @" + escapeHtml(sup.username || "None") + "\n" +
  "• <b>Current Support Link:</b> " + escapeHtml(sup.link || "None") + "\n\n" +
  "Normal users will see this contact when clicking the <b>🆘 Support</b> button.\n\n" +
  "👉 <b>To update:</b> Send the new Telegram Username (e.g. <code>@MySupport</code>) or Direct Link:";

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
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
