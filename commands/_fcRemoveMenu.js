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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

var forceChannels = Bot.getProperty("forceChannels", []);

if (!forceChannels || forceChannels.length === 0) {
  Bot.sendMessage("⚠️ No channels to remove.");
  return;
}

var keyb = [];
for (var i = 0; i < forceChannels.length; i++) {
  keyb.push([
    { text: "🗑️ " + (i + 1) + ". " + forceChannels[i].name, callback_data: "/fcRemovePrompt " + i }
  ]);
}
keyb.push([{ text: "⬅️ Back", callback_data: "/adminForceChannel" }]);

var msg = "🗑️ *Select a Force Channel to Remove:*\n`———————————————————————`\nClick on any channel below:";

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

