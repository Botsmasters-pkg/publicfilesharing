/*CMD
  command: /clearForce
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

Bot.setProperty("forceChannels", [], "json");
Bot.setProperty("forceChannel", null);

var keyb = [
  [{ text: "➕ Add Channel", callback_data: "/fcAdd" }],
  [{ text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }]
];

var msg = "🗑️ *All Force Channels have been cleared!*";

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
