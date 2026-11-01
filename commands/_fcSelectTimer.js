/*CMD
  command: /fcSelectTimer
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
var now = Date.now();
var isExpired = ch.expired || (ch.expiryTime > 0 && now >= ch.expiryTime);
var currentTimerTxt = "Permanent (No Timer)";

if (ch.expiryTime > 0) {
  if (isExpired) {
    currentTimerTxt = "Expired";
  } else {
    var remMs = ch.expiryTime - now;
    var remHours = Math.floor(remMs / (1000 * 60 * 60));
    var remMins = Math.floor((remMs % (1000 * 60 * 60)) / (1000 * 60));
    currentTimerTxt = remHours > 0 ? (remHours + "h " + remMins + "m remaining") : (remMins + " mins remaining");
  }
}

var msg = "⏱️ *Set Timer for Channel #" + (idx + 1) + "*\n`———————————————————————`\n\n" +
  "• *Target:* `" + ch.id + "`\n" +
  "• *Type:* `" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "`\n" +
  "• *Current Setting:* *" + currentTimerTxt + "*\n\n" +
  "👉 *Select Auto-Expiry Duration:*\n" +
  "_(The channel will automatically disappear from the user panel after this timer)_";

var keyb = [
  [
    { text: "⏱️ 5 Minutes", callback_data: "/fcApplyTimer " + idx + " 5" },
    { text: "⏱️ 10 Minutes", callback_data: "/fcApplyTimer " + idx + " 10" }
  ],
  [
    { text: "⏱️ 15 Minutes", callback_data: "/fcApplyTimer " + idx + " 15" },
    { text: "⏱️ 30 Minutes", callback_data: "/fcApplyTimer " + idx + " 30" }
  ],
  [
    { text: "⏱️ 1 Hour", callback_data: "/fcApplyTimer " + idx + " 60" },
    { text: "⏱️ 2 Hours", callback_data: "/fcApplyTimer " + idx + " 120" }
  ],
  [
    { text: "⏱️ 6 Hours", callback_data: "/fcApplyTimer " + idx + " 360" },
    { text: "⏱️ 12 Hours", callback_data: "/fcApplyTimer " + idx + " 720" }
  ],
  [
    { text: "⏱️ 24 Hours", callback_data: "/fcApplyTimer " + idx + " 1440" },
    { text: "⏳ Custom Time", callback_data: "/fcCustomTimer " + idx }
  ],
  [
    { text: "♾️ Permanent (Remove Timer)", callback_data: "/fcApplyTimer " + idx + " 0" }
  ],
  [
    { text: "⬅️ Back to Channels", callback_data: "/fcTimerMenu" }
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
