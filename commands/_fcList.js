/*CMD
  command: /fcList
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
var now = Date.now();

// Clean up any corrupted legacy entries
var forceChannels = [];
for (var k = 0; k < rawChannels.length; k++) {
  var c = rawChannels[k];
  if (c && c.id && c.id.indexOf("/fc") === -1 && c.name !== "/fcStepName" && c.id !== "/fcStepId" && (!c.link || c.link.indexOf("/fc") === -1)) {
    forceChannels.push(c);
  }
}
if (forceChannels.length !== rawChannels.length) {
  Bot.setProperty("forceChannels", forceChannels, "json");
}

if (!forceChannels || forceChannels.length === 0) {
  var emptyMsg = "📄 <b>Force Channels List</b>\n<code>———————————————————————</code>\n\n<i>No active force channels configured yet.</i>";
  var emptyKey = [
    [{ text: "➕ Add Channel", style: "primary" }],
    [{ text: "⬅️ Back to Force Channels", style: "primary" }]
  ];
  if (request.data) {
    try { Api.deleteMessage({ message_id: request.message.message_id }); } catch (e) {}
  }
  Api.sendMessage({ chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: emptyMsg, parse_mode: "HTML", reply_markup: { keyboard: emptyKey, resize_keyboard: true } });
  return;
}

var txt = "📄 <b>Configured Force Channels (" + forceChannels.length + ")</b>\n<code>———————————————————————</code>\n\n";
var inlkey = [];

for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  var isExpired = ch.expired || (ch.expiryTime > 0 && now >= ch.expiryTime);
  if (isExpired && !ch.expired) {
    ch.expired = true;
  }

  var isEnabled = (ch.enabled !== false);
  var enableTxt = isEnabled ? "🟢 ENABLED" : "⚪ DISABLED";
  var statusTxt = isExpired ? "🔴 EXPIRED" : "🟢 ACTIVE";
  var remainingTxt = "Permanent (No timer)";

  if (ch.expiryTime > 0) {
    if (isExpired) {
      remainingTxt = "Expired";
    } else {
      var remMs = ch.expiryTime - now;
      var remHours = Math.floor(remMs / (1000 * 60 * 60));
      var remMins = Math.floor((remMs % (1000 * 60 * 60)) / (1000 * 60));
      remainingTxt = remHours > 0 ? (remHours + "h " + remMins + "m left") : (remMins + " mins left");
    }
  }

  txt += "<b>" + (i + 1) + ". " + escapeHtml(ch.name || ch.id) + "</b>\n";
  txt += "• ID: <code>" + escapeHtml(ch.id) + "</code>\n";
  txt += "• Type: <code>" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "</code>\n";
  txt += "• Status: " + enableTxt + " | " + statusTxt + "\n";
  txt += "• Timer: <b>" + remainingTxt + "</b>\n";
  if (ch.link) {
    txt += "• Link: " + escapeHtml(ch.link) + "\n";
  }
  txt += "\n";

  // Actions for this channel
  inlkey.push([
    { text: isEnabled ? "🟢 Turn Off (Disable)" : "⚪ Turn On (Enable)", callback_data: "/fcToggle " + i, style: "primary" },
    { text: "⏱️ Timer", callback_data: "/fcSelectTimer " + i, style: "primary" }
  ]);
  inlkey.push([
    { text: "❌ Remove Channel " + (i + 1), callback_data: "/fcRemovePrompt " + i, style: "primary" }
  ]);
}

// Save any auto-expired updates
Bot.setProperty("forceChannels", forceChannels, "json");

inlkey.push([
  { text: "➕ Add Channel", callback_data: "/fcAdd", style: "primary" },
  { text: "⏱️ Set Expiry Timer", callback_data: "/fcTimerMenu", style: "primary" }
]);
inlkey.push([
  { text: "🗑️ Clear All Channels", callback_data: "/clearForce", style: "primary" },
  { text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel", style: "primary" }
]);

var fcListPrimaryKeyboard = [
  [
    { text: "➕ Add Channel", style: "primary" },
    { text: "⏱️ Set Expiry Timer", style: "primary" }
  ],
  [
    { text: "❌ Remove Channel", style: "primary" },
    { text: "⬅️ Back to Force Channels", style: "primary" }
  ]
];

if (request.data) {
  try { Api.deleteMessage({ message_id: request.message.message_id }); } catch (e) {}
}

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: txt,
  parse_mode: "HTML",
  reply_markup: { keyboard: fcListPrimaryKeyboard, resize_keyboard: true }
});
