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

var isAdmin = (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

var current = Bot.getProperty("welcomeMessage", "Default Welcome Message");

var msg = "👋 *Custom Welcome Message Settings*\n`———————————————————————`\n\n";
msg += "📌 *Current Welcome Message:*\n" + current + "\n\n";
msg += "👉 *Simply send your new welcome message text directly:*\n";
msg += "_(You don't need to type any slash command, just send your text!)_";

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

// Automatically listen for the next message as the new welcome text
Bot.run({ command: "/onSetWelcome" });
