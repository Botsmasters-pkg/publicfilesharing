/*CMD
  command: /fcRemoveConfirm
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
var idx = parseInt(params);

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var forceChannels = Bot.getProperty("forceChannels", []);
var removedName = "Channel";

if (forceChannels[idx]) {
  removedName = forceChannels[idx].id || forceChannels[idx].name || "Channel";
  forceChannels.splice(idx, 1);
  Bot.setProperty("forceChannels", forceChannels, "json");
}

var msg = "🗑️ <b>Channel Removed Successfully!</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Channel <code>" + escapeHtml(removedName) + "</code> has been deleted from Force Channels.";

var keyb = [
  [{ text: "📄 View Remaining Channels", callback_data: "/fcList", style: "primary" }],
  [{ text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel", style: "primary" }]
];

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
    { text: "⬅️ Back to Force Channels", style: "primary" }
  ]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
    parse_mode: "HTML",
    reply_markup: { keyboard: fcPrimaryKeyboard, resize_keyboard: true }
  });
}
