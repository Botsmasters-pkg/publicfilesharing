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

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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

var msg = "⏱️ <b>Set Timer for Channel #" + (idx + 1) + "</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Target:</b> <code>" + escapeHtml(ch.id) + "</code>\n" +
  "• <b>Type:</b> <code>" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "</code>\n" +
  "• <b>Current Setting:</b> <b>" + currentTimerTxt + "</b>\n\n" +
  "👉 <b>Select Auto-Expiry Duration below:</b>\n" +
  "<i>(The channel will automatically disappear from the user panel after this timer)</i>";

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
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryTimerKeyboard, resize_keyboard: true }
});
