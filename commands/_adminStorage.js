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

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
if (!isAdmin) return;

var current = Bot.getProperty("storageChannel", "None");

var msg = "🏷️ *Storage Channel Settings*\n`———————————————————————`\n\n";
msg += "Current Storage Channel: `" + current + "`\n\n";
msg += "*How to set / change:*\n";
msg += "1. Add this bot as an **Admin** in your storage channel.\n";
msg += "2. Send command: `/setStorage <Channel_Username_Or_ID>`\n";
msg += "   _Example:_ `/setStorage @my_file_channel` or `/setStorage -1001234567890`\n\n";
msg += "To remove: `/clearStorage`";

var keyb = [
  [{ text: "❌ Clear Storage", callback_data: "/clearStorage" }],
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
