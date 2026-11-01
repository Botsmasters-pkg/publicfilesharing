/*CMD
  command: /fcAdd
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

var msg = "➕ *Add New Force Channel (Step 1/5)*\n`———————————————————————`\n\n" +
  "👉 *Send the Channel Name:*\n" +
  "_(Example: Updates Channel, Official Community)_";

var keyb = [
  [{ text: "⬅️ Cancel & Back", callback_data: "/adminForceChannel" }]
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

Bot.run({ command: "/fcStepName" });

