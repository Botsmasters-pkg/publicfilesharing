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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var rawChannels = Bot.getProperty("forceChannels", []);
var forceChannels = [];
for (var k = 0; k < rawChannels.length; k++) {
  var c = rawChannels[k];
  if (c && c.id && c.id.indexOf("/fc") === -1 && (!c.link || c.link.indexOf("/fc") === -1)) {
    forceChannels.push(c);
  }
}
if (forceChannels.length !== rawChannels.length) {
  Bot.setProperty("forceChannels", forceChannels, "json");
}

var now = Date.now();

if (!forceChannels || forceChannels.length === 0) {
  var emptyMsg = "⏱️ <b>Force Channel Auto-Expiry Timer</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "⚠️ <i>No force channels found! Please add a channel first.</i>";
  var emptyKey = [
    [{ text: "➕ Add Channel", style: "primary" }],
    [{ text: "⬅️ Back to Force Channels", style: "primary" }]
  ];
  if (request.data) {
    try { Api.deleteMessage({ message_id: request.message.message_id }); } catch (e) {}
  }
  Api.sendMessage({ text: emptyMsg, parse_mode: "HTML", reply_markup: { keyboard: emptyKey, resize_keyboard: true } });
  return;
}

var msg = "⏱️ <b>Set Channel Auto-Expiry Timer</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Select a channel button below to configure or change its auto-expiry timer:\n\n";

var primaryKeyb = [];
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

  msg += "<b>" + (i + 1) + ".</b> <code>" + escapeHtml(ch.id) + "</code>\n" +
    "• Type: <code>" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "</code>\n" +
    "• Status: " + timerStatus + "\n\n";

  row.push({
    text: "⏱️ Channel " + (i + 1),
    style: "primary"
  });

  if (row.length === 2) {
    primaryKeyb.push(row);
    row = [];
  }
}

if (row.length > 0) {
  primaryKeyb.push(row);
}

primaryKeyb.push([
  { text: "⬅️ Back to Force Channels", style: "primary" }
]);

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryKeyb, resize_keyboard: true }
});
