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

var ch = forceChannels[idx];

var msg = "⚠️ *Confirm Channel Removal*\n`———————————————————————`\n\n" +
  "Are you sure you want to remove this channel?\n" +
  "• Channel: `" + (ch.id || ch.name) + "`\n" +
  "• Type: `" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "`\n\n" +
  "_This will immediately remove its JOIN button from the user panel._";

var keyb = [
  [
    { text: "🗑️ Yes, Remove Channel", callback_data: "/fcRemoveConfirm " + idx },
    { text: "❌ Cancel", callback_data: "/fcList" }
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
