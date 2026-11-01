/*CMD
  command: /fcCustomTime
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

var msg = "⏳ *Set Custom Active Time*\n`———————————————————————`\n\n" +
  "👉 *Send the active duration in total minutes or hours/minutes:*\n\n" +
  "_Examples:_\n" +
  "• `45` = 45 Minutes\n" +
  "• `2h` = 2 Hours\n" +
  "• `1h 30m` = 1 Hour 30 Minutes (90 Minutes)\n" +
  "• `3d` = 3 Days";

var keyb = [
  [{ text: "⬅️ Cancel", callback_data: "/adminForceChannel" }]
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

Bot.run({ command: "/onFcCustomTime" });
