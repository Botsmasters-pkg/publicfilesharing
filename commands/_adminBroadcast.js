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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

Bot.setProperty("admin_state_" + user.telegramid, "waiting_broadcast", "string");

var allUsers = Bot.getProperty("allBotUsers", []);

var msg = "📣 <b>Broadcast System</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "👥 <b>Total Registered Bot Users:</b> <b>" + allUsers.length + "</b>\n\n" +
  "Supported Broadcast Types:\n" +
  "• <b>Text Announcement</b>\n" +
  "• <b>Photo with Caption</b>\n" +
  "• <b>Video with Caption</b>\n\n" +
  "👉 <b>Send the message, photo, or video you want to broadcast now:</b>\n" +
  "<i>(No command prefix needed, just send it directly)</i>";

var keyb = [
  [{ text: "⬅️ Cancel & Back", callback_data: "/admin" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
}
