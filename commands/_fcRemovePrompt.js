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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (!params) return;
var idx = parseInt(params);

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

var ch = forceChannels[idx];

var msg = "⚠️ *Confirm Channel Removal*\n`———————————————————————`\n\n" +
  "Are you sure you want to remove the channel:\n" +
  "• Name: *" + ch.name + "*\n" +
  "• ID: `" + ch.id + "`\n\n" +
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
