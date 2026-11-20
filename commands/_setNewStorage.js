/*CMD
  command: /setNewStorage
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

// Start channel configuration process now
Bot.setProperty("admin_state_" + user.telegramid, "waiting_storage", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var currentStorage = Bot.getProperty("storageChannel", "-1004304151228");

var msg = "⚙️ <b>Set New Storage Channel</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Current Active Storage:</b> <code>" + escapeHtml(currentStorage) + "</code>\n\n" +
  "👉 <b>Please send your Channel details:</b>\n" +
  "• <b>Numeric Chat ID:</b> <code>-1003946288718</code>\n" +
  "• <b>Public Username:</b> <code>@YourChannel</code>\n" +
  "• <b>Or simply Forward any post</b> from that channel here!\n\n" +
  "<i>⚠️ Prerequisites for Verification:</i>\n" +
  "1. The destination must be an actual Telegram <b>Channel</b>.\n" +
  "2. Add this bot to the channel as an <b>Administrator</b>.\n" +
  "3. Grant <b>Post Messages</b> permission.\n" +
  "4. The bot will automatically test permissions before activating.";

var cancelKeyboard = [
  [{ text: "❌ Cancel", style: "primary" }]
];

if (request.data && request.message) {
  try {
    Api.deleteMessage({
      chat_id: request.message.chat.id,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: cancelKeyboard, resize_keyboard: true }
});
