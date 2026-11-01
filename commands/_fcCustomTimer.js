/*CMD
  command: /fcCustomTimer
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
var idx = parseInt(params.trim());

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

var ch = forceChannels[idx];
Bot.setProperty("temp_fc_custom_idx_" + user.telegramid, idx, "integer");

var msg = "⏳ *Custom Auto-Expiry Timer*\n`———————————————————————`\n\n" +
  "Configure custom timer for Channel #" + (idx + 1) + " (`" + ch.id + "`)\n\n" +
  "👉 *Send custom duration in chat:*\n\n" +
  "_Valid formats:_\n" +
  "• `45m` (45 Minutes)\n" +
  "• `3h` (3 Hours)\n" +
  "• `2h 30m` (2 Hours 30 Minutes)\n" +
  "• `1d` (1 Day / 24 Hours)\n" +
  "• `90` (90 Minutes)\n\n" +
  "Send your desired duration now:";

var keyb = [
  [{ text: "⬅️ Cancel", callback_data: "/fcSelectTimer " + idx }]
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

Bot.run({ command: "/onFcCustomTimer" });

