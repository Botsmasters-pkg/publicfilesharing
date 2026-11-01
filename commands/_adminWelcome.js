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

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
if (!isAdmin) return;

var current = Bot.getProperty("welcomeMessage", "Default Welcome Message");

var msg = "👋 *Custom Welcome Message Settings*\n`———————————————————————`\n\n";
msg += "*Current Message:*\n" + current + "\n\n";
msg += "*To update:*\n";
msg += "Send: `/setWelcome <Your New Welcome Message>`\n\n";
msg += "_Example:_\n`/setWelcome Hello! Welcome to our File Store Bot.`\n\n";
msg += "*To reset to default:*\n";
msg += "Send: `/clearWelcome`";

var keyb = [
  [{ text: "🔄 Reset to Default", callback_data: "/clearWelcome" }],
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
