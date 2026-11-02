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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (!params) return;
var idx = parseInt(params.trim());
Bot.setProperty("temp_fc_custom_idx_" + user.telegramid, idx, "integer");

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
  "👉 *Select Auto-Expiry Duration below:*\n" +
  "_(The channel will automatically disappear from the user panel after this timer)_";

var primaryTimerKeyboard = [
  [
    { text: "⏱️ 5 Minutes", style: "primary" },
    { text: "⏱️ 10 Minutes", style: "primary" }
  ],
  [
    { text: "⏱️ 30 Minutes", style: "primary" },
    { text: "⏱️ 1 Hour", style: "primary" }
  ],
  [
    { text: "⏱️ 1 Day", style: "primary" },
    { text: "✏️ Custom Timer", style: "primary" }
  ],
  [
    { text: "♾️ Permanent (Turn Off)", style: "primary" }
  ],
  [
    { text: "⬅️ Back to Force Channels", style: "primary" }
  ]
];

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { keyboard: primaryTimerKeyboard, resize_keyboard: true }
});
