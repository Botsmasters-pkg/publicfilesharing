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

var forceChannels = Bot.getProperty("forceChannels", []);
var removedName = "Channel";

if (forceChannels[idx]) {
  removedName = forceChannels[idx].id || forceChannels[idx].name || "Channel";
  forceChannels.splice(idx, 1);
  Bot.setProperty("forceChannels", forceChannels, "json");
}

var msg = "🗑️ *Channel Removed!*\n`———————————————————————`\n" +
  "Channel `" + removedName + "` has been successfully deleted from Force Channels.";

var keyb = [
  [{ text: "📄 View Remaining Channels", callback_data: "/fcList" }],
  [{ text: "⬅️ Back", callback_data: "/adminForceChannel" }]
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
