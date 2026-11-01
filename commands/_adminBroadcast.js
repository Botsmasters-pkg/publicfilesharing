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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

Bot.setProperty("admin_state_" + user.telegramid, "waiting_broadcast", "string");

var allUsers = Bot.getProperty("allBotUsers", []);

var msg = "📣 *Broadcast System*\n`———————————————————————`\n\n" +
  "👥 *Total Registered Bot Users:* *" + allUsers.length + "*\n\n" +
  "Supported Broadcast Types:\n" +
  "• *Text Announcement*\n" +
  "• *Photo with Caption*\n" +
  "• *Video with Caption*\n\n" +
  "👉 *Send the message, photo, or video you want to broadcast now:*\n" +
  "_(No command prefix needed, just send it directly)_";

var keyb = [
  [{ text: "⬅️ Cancel & Back", callback_data: "/admin" }]
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
