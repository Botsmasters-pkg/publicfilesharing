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

// Start channel configuration process now
Bot.setProperty("admin_state_" + user.telegramid, "waiting_storage", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var msg = "⚙️ <b>Set New Storage Channel</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "👉 <b>Please send the Telegram Channel ID or Username:</b>\n\n" +
  "• <b>Numeric Chat ID:</b> <code>-1001234567890</code>\n" +
  "• <b>Public Username:</b> <code>@channelname</code>\n" +
  "• <b>Or simply Forward any post</b> from that channel here!\n\n" +
  "<i>⚠️ Prerequisites for Verification:</i>\n" +
  "1. The destination must be an actual Telegram <b>Channel</b>.\n" +
  "2. The bot must be added as an <b>Administrator</b> with <b>Post Messages</b> permission.\n" +
  "3. The bot will automatically verify permissions before activating the channel.";

var cancelKeyboard = [
  [{ text: "❌ Cancel", style: "primary" }]
];

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: cancelKeyboard, resize_keyboard: true }
});
