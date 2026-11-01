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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

Bot.setProperty("admin_state_" + user.telegramid, "waiting_storage", "string");

var currentStorage = Bot.getProperty("storageChannel", "-1004304151228");

var msg = "📦 *Custom Storage Channel Settings*\n`———————————————————————`\n\n" +
  "• Current Storage Channel: `" + currentStorage + "`\n" +
  "• Default Storage Channel: `-1004304151228`\n\n" +
  "👉 *Send the new Channel ID or Username in chat:*\n" +
  "_(Example: `-1001234567890` or `@MyStorageChannel`)_\n\n" +
  "*(Make sure the bot is an Administrator in that channel!)*";

var keyb = [
  [{ text: "🔄 Reset to Default (-1004304151228)", callback_data: "/resetStorageDefault" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
