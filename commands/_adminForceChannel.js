/*CMD
  command: /adminForceChannel
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

var current = Bot.getProperty("forceChannel", "None");

var msg = "🔧 *Force Subscribe / Host Channel*\n`———————————————————————`\n\n";
msg += "Current Force Channel: `" + current + "`\n\n";
msg += "*How to set / change:*\n";
msg += "1. Add this bot as an **Admin** in the channel.\n";
msg += "2. Send command: `/setForce <Channel_Username_Or_ID>`\n";
msg += "   _Example:_ `/setForce @mychannel` or `/setForce -1001234567890`\n\n";
msg += "To remove: `/clearForce`";

var keyb = [
  [{ text: "❌ Clear Force Channel", callback_data: "/clearForce" }],
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
