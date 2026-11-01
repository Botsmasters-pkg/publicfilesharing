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
var type = params.trim().toLowerCase();
Bot.setProperty("temp_fc_type_" + user.telegramid, type, "string");

var msg = "";
if (type === "public") {
  msg = "📢 *Add Public Channel*\n`———————————————————————`\n\n" +
    "👉 *Send the Channel Username or Link:*\n" +
    "_(Example: `@MyChannel` or `https://t.me/MyChannel`)_\n\n" +
    "*(Make sure the bot is added as Administrator in the channel)*";
} else if (type === "request") {
  msg = "📩 *Add Private Request Channel*\n`———————————————————————`\n\n" +
    "👉 *Send Channel ID and Join Request Link:*\n" +
    "_(Example: `-1001234567890 https://t.me/+AbCdEfGhIjK`)_\n\n" +
    "_Tip: Send both in one message separated by a space._\n" +
    "*(Make sure the bot is added as Administrator in the channel)*";
} else {
  msg = "🔒 *Add Private Channel*\n`———————————————————————`\n\n" +
    "👉 *Send Channel ID and Invite Link:*\n" +
    "_(Example: `-1001234567890 https://t.me/+AbCdEfGhIjK`)_\n\n" +
    "_Tip: Send both in one message separated by a space._\n" +
    "*(Make sure the bot is added as Administrator in the channel)*";
}

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

Bot.run({ command: "/fcSaveChannel" });
