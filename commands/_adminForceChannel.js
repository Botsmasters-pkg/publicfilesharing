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
