/*CMD
  command: /adminStorage
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

Bot.setProperty("admin_state_" + user.telegramid, "waiting_storage", "string");

var currentStorage = Bot.getProperty("storageChannel", "-1004304151228");

var msg = "📦 <b>Custom Storage Channel Settings</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• Current Storage Channel: <code>" + escapeHtml(currentStorage) + "</code>\n" +
  "• Default Storage Channel: <code>-1004304151228</code>\n\n" +
  "👉 <b>Send the new Channel ID or Username in chat:</b>\n" +
  "<i>(Example: <code>-1001234567890</code> or <code>@MyStorageChannel</code>)</i>\n\n" +
  "<i>(Make sure the bot is an Administrator in that channel!)</i>";

var keyb = [
  [{ text: "🔄 Reset to Default (-1004304151228)", callback_data: "/resetStorageDefault" }],
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
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
}
