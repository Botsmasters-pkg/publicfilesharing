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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

var current = Bot.getProperty("forceChannel", "None");

var msg = "🔧 *Force Subscribe / Host Channel*\n`———————————————————————`\n\n";
msg += "📌 *Current Channel:* `" + current + "`\n\n";
msg += "👉 *Simply send the Channel @username or ID directly:*\n";
msg += "_(You don't need to type any slash command, just send @channel or -100...)_";

var keyb = [
  [{ text: "❌ Remove Channel", callback_data: "/clearForce" }],
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

// Automatically listen for the next message as the new force channel
Bot.run({ command: "/onSetForce" });
