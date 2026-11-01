/*CMD
  command: /fcStepType
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

if (!params) return;
var type = params.trim();
Bot.setProperty("temp_fc_type_" + user.telegramid, type, "string");

var msg = "➕ *Add New Force Channel (Step 4/5)*\n`———————————————————————`\n\n" +
  "Selected Type: *" + type.toUpperCase() + "*\n\n" +
  "👉 *Send the Channel Username or Invite Link:*\n" +
  "_(Example: `@MyChannel` or `https://t.me/+AbCdEfGhIjK`)_";

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

Bot.run({ command: "/fcStepLink" });

