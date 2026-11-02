/*CMD
  command: /fcRemovePrompt
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

var msg = "⚠️ <b>Confirm Channel Removal</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Are you sure you want to remove this channel?\n" +
  "• <b>Channel #" + (idx + 1) + ":</b> <code>" + escapeHtml(ch.id || ch.name) + "</code>\n" +
  "• <b>Type:</b> <code>" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "</code>\n\n" +
  "<i>This will immediately remove its JOIN button from the user panel.</i>";

var keyb = [
  [
    { text: "🗑️ Yes, Remove Channel", callback_data: "/fcRemoveConfirm " + idx, style: "primary" },
    { text: "❌ Cancel", callback_data: "/fcList", style: "primary" }
  ]
];

var removePromptPrimaryKeyboard = [
  [{ text: "🗑️ Yes, Remove Channel " + (idx + 1), style: "primary" }],
  [{ text: "⬅️ Back to Force Channels", style: "primary" }]
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
    text: msg,
    parse_mode: "HTML",
    reply_markup: { keyboard: removePromptPrimaryKeyboard, resize_keyboard: true }
  });
}
