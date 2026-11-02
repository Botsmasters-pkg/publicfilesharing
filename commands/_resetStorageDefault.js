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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

Bot.setProperty("storageChannel", "-1004304151228", "string");

var keyb = [
  [{ text: "⬅️ Back to Storage Settings", callback_data: "/adminStorage" }]
];

var msg = "✅ <b>Storage Channel reset to Default:</b> <code>-1004304151228</code>";

var storagePrimaryKeyboard = [
  [{ text: "🏷️ Storage Channel", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
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
    reply_markup: { keyboard: storagePrimaryKeyboard, resize_keyboard: true }
  });
}
