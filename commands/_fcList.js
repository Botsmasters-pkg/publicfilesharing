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

var rawChannels = Bot.getProperty("forceChannels", []);
var now = Date.now();

// Clean up any corrupted legacy entries
var forceChannels = [];
for (var k = 0; k < rawChannels.length; k++) {
  var c = rawChannels[k];
  if (c && c.id && c.id.indexOf("/fc") === -1 && c.name !== "/fcStepName" && c.id !== "/fcStepId") {
    forceChannels.push(c);
  }
}
if (forceChannels.length !== rawChannels.length) {
  Bot.setProperty("forceChannels", forceChannels, "json");
}

if (!forceChannels || forceChannels.length === 0) {
  var emptyMsg = "📄 <b>Force Channels List</b>\n<code>———————————————————————</code>\n\n<i>No active force channels configured yet.</i>";
  var emptyKey = [
    [{ text: "➕ Add Channel", callback_data: "/fcAdd" }],
    [{ text: "⬅️ Back", callback_data: "/adminForceChannel" }]
  ];
  if (request.data) {
    Api.editMessageText({ message_id: request.message.message_id, text: emptyMsg, parse_mode: "HTML", reply_markup: { inline_keyboard: emptyKey } });
  } else {
    Api.sendMessage({ text: emptyMsg, parse_mode: "HTML", reply_markup: { inline_keyboard: emptyKey } });
  }
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

  var expiryDateTxt = ch.expiryTime > 0 ? new Date(ch.expiryTime).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "Permanent";

  txt += "<b>" + (i + 1) + ". " + (ch.name || ch.id) + "</b>\n";
  txt += "• ID: <code>" + ch.id + "</code>\n";
  txt += "• Type: <code>" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "</code>\n";
  txt += "• Status: " + enableTxt + " | " + statusTxt + "\n";
  txt += "• Timer: <b>" + remainingTxt + "</b>\n";
  if (ch.link) {
    txt += "• Link: " + ch.link + "\n";
  }
  txt += "\n";

  // Actions for this channel
  inlkey.push([
    { text: isEnabled ? "🟢 Turn Off (Disable)" : "⚪ Turn On (Enable)", callback_data: "/fcToggle " + i },
    { text: "⏱️ Timer", callback_data: "/fcSelectTimer " + i }
  ]);
  inlkey.push([
    { text: "❌ Remove Channel " + (i + 1), callback_data: "/fcRemovePrompt " + i }
  ]);
}

// Save any auto-expired updates
Bot.setProperty("forceChannels", forceChannels, "json");

inlkey.push([
  { text: "➕ Add Channel", callback_data: "/fcAdd" },
  { text: "⏱️ Set Expiry Timer", callback_data: "/fcTimerMenu" }
]);
inlkey.push([
  { text: "🗑️ Clear All Channels", callback_data: "/clearForce" },
  { text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }
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
  text: txt,
  parse_mode: "HTML",
  reply_markup: { keyboard: fcListPrimaryKeyboard, resize_keyboard: true }
});
