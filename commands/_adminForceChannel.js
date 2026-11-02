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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

Bot.setProperty("admin_state_" + user.telegramid, "", "string");

var forceChannels = Bot.getProperty("forceChannels", []);
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

var bbFcKeyboard = "➕ Add Channel,⏱️ Set Expiry Timer\n📄 List Channels,❌ Remove Channel\n⬅️ Back to Admin Panel";

var msg = "🔧 *Force Channels Management*\n`———————————————————————`\n\n" +
  "Manage mandatory subscription channels (Public, Private, Join Request).\n\n" +
  "📊 *Overview:*\n" +
  "• Active & Enabled: *" + activeCount + "*\n" +
  "• Disabled Channels: *" + disabledCount + "*\n" +
  "• Expired Channels: *" + expiredCount + "*\n" +
  "• Total Channels: *" + forceChannels.length + "*\n\n" +
  "Select an action below:";

var keyb = [
  [
    { text: "➕ Add Channel", callback_data: "/fcAdd" },
    { text: "⏱️ Set Expiry Timer", callback_data: "/fcTimerMenu" }
  ],
  [
    { text: "📄 List Channels", callback_data: "/fcList" },
    { text: "❌ Remove Channel", callback_data: "/fcRemoveMenu" }
  ],
  [
    { text: "⬅️ Back to Admin Panel", callback_data: "/admin" }
  ]
];

Bot.sendKeyboard(bbFcKeyboard, "🔧 Force Channel Menu:");

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
    reply_markup: { keyboard: fcPrimaryKeyboard, resize_keyboard: true }
  });
  Api.sendMessage({
    text: "👇 Quick Actions:",
    reply_markup: { inline_keyboard: keyb }
  });
}
