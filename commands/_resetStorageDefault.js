/*CMD
  command: /resetStorageDefault
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

Bot.setProperty("storageChannel", "-1004304151228", "string");

var keyb = [
  [{ text: "⬅️ Back to Storage Settings", callback_data: "/adminStorage" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: "✅ *Storage Channel reset to Default:* `-1004304151228`",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: "✅ *Storage Channel reset to Default:* `-1004304151228`",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
