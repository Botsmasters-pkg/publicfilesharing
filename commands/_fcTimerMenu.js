/*CMD
  command: /fcTimerMenu
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

var forceChannels = Bot.getProperty("forceChannels", []);
var now = Date.now();

if (!forceChannels || forceChannels.length === 0) {
  var emptyMsg = "⏱️ *Force Channel Auto-Expiry Timer*\n`———————————————————————`\n\n" +
    "⚠️ _No force channels found! Please add a channel first._";
  var emptyKey = [
    [{ text: "➕ Add Channel", callback_data: "/fcAdd" }],
    [{ text: "⬅️ Back", callback_data: "/adminForceChannel" }]
  ];
  if (request.data) {
    Api.editMessageText({ message_id: request.message.message_id, text: emptyMsg, parse_mode: "Markdown", reply_markup: { inline_keyboard: emptyKey } });
  } else {
    Api.sendMessage({ text: emptyMsg, parse_mode: "Markdown", reply_markup: { inline_keyboard: emptyKey } });
  }
  return;
}

var msg = "⏱️ *Set Channel Auto-Expiry Timer*\n`———————————————————————`\n\n" +
  "Select a channel number below to configure or change its auto-expiry timer:\n\n";

var numberButtons = [];
var row = [];

for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  var isExpired = ch.expired || (ch.expiryTime > 0 && now >= ch.expiryTime);
  var timerStatus = "🟢 Permanent (No Timer)";
  if (ch.expiryTime > 0) {
    if (isExpired) {
      timerStatus = "🔴 Expired";
    } else {
      var remMs = ch.expiryTime - now;
      var remHours = Math.floor(remMs / (1000 * 60 * 60));
      var remMins = Math.floor((remMs % (1000 * 60 * 60)) / (1000 * 60));
      timerStatus = "⏳ " + (remHours > 0 ? (remHours + "h " + remMins + "m") : (remMins + "m")) + " left";
    }
  }

  msg += "*" + (i + 1) + ".* `" + ch.id + "`\n" +
    "• Type: `" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "`\n" +
    "• Status: " + timerStatus + "\n\n";

  row.push({
    text: "Channel " + (i + 1),
    callback_data: "/fcSelectTimer " + i
  });

  if (row.length === 2) {
    numberButtons.push(row);
    row = [];
  }
}

if (row.length > 0) {
  numberButtons.push(row);
}

numberButtons.push([
  { text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }
]);

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: numberButtons }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: numberButtons }
  });
}

