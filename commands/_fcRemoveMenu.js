/*CMD
  command: /fcRemoveMenu
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

var forceChannels = Bot.getProperty("forceChannels", []);

if (!forceChannels || forceChannels.length === 0) {
  Bot.sendMessage("⚠️ No channels to remove.");
  return;
}

var removePrimaryKeyboard = [];
var rRow = [];
for (var i = 0; i < forceChannels.length; i++) {
  rRow.push({ text: "❌ Remove Channel " + (i + 1), style: "primary" });
  if (rRow.length === 2) {
    removePrimaryKeyboard.push(rRow);
    rRow = [];
  }
}
if (rRow.length > 0) {
  removePrimaryKeyboard.push(rRow);
}
removePrimaryKeyboard.push([{ text: "🗑️ Clear All Channels", style: "primary" }]);
removePrimaryKeyboard.push([{ text: "⬅️ Back to Force Channels", style: "primary" }]);

var msg = "🗑️ *Select a Force Channel to Remove:*\n`———————————————————————`\nClick on any channel button below to remove it:";

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { keyboard: removePrimaryKeyboard, resize_keyboard: true }
});
