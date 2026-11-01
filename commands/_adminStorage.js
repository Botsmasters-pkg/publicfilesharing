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
msg += "📌 *Current Channel:* `" + current + "`\n\n";
msg += "👉 *Simply send the Channel @username or ID directly:*\n";
msg += "_(You don't need to type any slash command, just send @channel or -100...)_";

var keyb = [
  [{ text: "❌ Remove Channel", callback_data: "/clearStorage" }],
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

// Automatically listen for the next message as the new storage channel
Bot.run({ command: "/onSetStorage" });
