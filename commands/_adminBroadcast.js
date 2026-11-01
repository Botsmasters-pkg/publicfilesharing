/*CMD
  command: /adminBroadcast
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

var allUsers = Bot.getProperty("allBotUsers", []);

var msg = "📣 *Broadcast System*\n`———————————————————————`\n\n";
msg += "👥 *Total Registered Users:* *" + allUsers.length + "*\n\n";
msg += "👉 *Simply send the message you want to broadcast directly:*\n";
msg += "_(You can send text, photo with caption, or announcement - no slash command needed!)_";

var keyb = [
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

// Automatically listen for the next message to broadcast
Bot.run({ command: "/onBroadcast" });
