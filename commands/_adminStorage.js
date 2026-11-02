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

var msg = "📦 <b>Storage Channel Settings</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Current Storage Channel:</b> <code>" + escapeHtml(currentStorage) + "</code>\n" +
  "• <b>Default Storage Channel:</b> <code>-1004304151228</code>\n\n" +
  "👉 <b>How to set a Storage Channel:</b>\n" +
  "• Send the <b>Numeric Chat ID</b> (e.g. <code>-1004304151228</code>)\n" +
  "• Or send <b>@Username</b> (e.g. <code>@MyStorageBackup</code>)\n" +
  "• Or simply <b>forward any post</b> from your storage channel here!\n\n" +
  "<i>⚠️ Note: The bot MUST be an Administrator in your storage channel with 'Post Messages' permission.</i>";

var keyb = [
  [{ text: "🔄 Reset to Default (-1004304151228)", callback_data: "/resetStorageDefault", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin", style: "primary" }]
];

var storagePrimaryKeyboard = [
  [{ text: "🔄 Reset to Default Storage", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
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
    reply_markup: { keyboard: storagePrimaryKeyboard, resize_keyboard: true }
  });
}
