/*CMD
  command: /adminForceChannel
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

// Clear any dangling admin text state
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

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

var activeCount = 0;
var disabledCount = 0;
var expiredCount = 0;
var now = Date.now();

for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  if (ch.enabled === false) {
    disabledCount++;
  } else if (!ch.expired && (ch.expiryTime === 0 || now < ch.expiryTime)) {
    activeCount++;
  } else {
    expiredCount++;
  }
}

// Primary Keyboard with style: "primary"
var fcPrimaryKeyboard = [
  [
    { text: "➕ Add Channel", style: "primary" },
    { text: "⏱️ Set Expiry Timer", style: "primary" }
  ],
  [
    { text: "📄 List Channels", style: "primary" },
    { text: "❌ Remove Channel", style: "primary" }
  ],
  [
    { text: "⬅️ Back to Admin Panel", style: "primary" }
  ]
];

var msg = "🔧 *Force Channels Management*\n`———————————————————————`\n\n" +
  "Manage mandatory subscription channels (Public, Private, Join Request).\n\n" +
  "📊 *Overview:*\n" +
  "• Active & Enabled: *" + activeCount + "*\n" +
  "• Disabled Channels: *" + disabledCount + "*\n" +
  "• Expired Channels: *" + expiredCount + "*\n" +
  "• Total Channels: *" + forceChannels.length + "*\n\n" +
  "Select an action using the primary buttons below:";

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { keyboard: fcPrimaryKeyboard, resize_keyboard: true }
});
