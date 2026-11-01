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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

var current = Bot.getProperty("storageChannel", "-1004304151228");

var msg = "🏷️ *Storage Channel Management*\n`———————————————————————`\n\n" +
  "📌 *Current Storage Channel ID:* `" + current + "`\n" +
  "⚙️ *Default Channel ID:* `-1004304151228`\n\n" +
  "All user uploads are automatically backed up to this channel.\n\n" +
  "👉 *To update:* Simply send the new Channel ID (e.g. `-100...`) or @username in chat:\n" +
  "_(Make sure the bot is an Administrator in the storage channel!)_";

var keyb = [
  [
    { text: "🔄 Reset to Default (-1004304151228)", callback_data: "/resetStorageDefault" }
  ],
  [
    { text: "⬅️ Back to Admin Panel", callback_data: "/admin" }
  ]
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

Bot.run({ command: "/onSetStorage" });
