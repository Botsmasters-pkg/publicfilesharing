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
Bot.setProperty("storageChannelTitle", "Primary System Storage", "string");
Bot.setProperty("storageChannelUsername", "", "string");

var keyb = [
  [{ text: "⚙️ Set New Storage Channel", callback_data: "/setNewStorage", style: "primary" }],
  [{ text: "⬅️ Back to Storage Settings", callback_data: "/adminStorage", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin", style: "primary" }]
];

var msg = "✅ <b>Storage Channel Restored to System Default!</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Active Storage Channel:</b> <code>-1004304151228</code>\n" +
  "• <b>Status:</b> 🟢 <b>Default Operational</b>\n\n" +
  "<i>All upcoming uploads will automatically backup to the primary system storage channel.</i>";

var storagePrimaryKeyboard = [
  [{ text: "⚙️ Set New Storage Channel", style: "primary" }],
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
