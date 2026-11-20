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

var msg = "🗑️ <b>Select a Force Channel to Remove:</b>\n" +
  "<code>———————————————————————</code>\n" +
  "Click on any channel button below to remove it:";

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: removePrimaryKeyboard, resize_keyboard: true }
});
