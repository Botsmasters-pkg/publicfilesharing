/*CMD
  command: /clearForce
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

Bot.setProperty("forceChannels", [], "json");
Bot.setProperty("forceChannel", null);

var clearForcePrimary = [
  [{ text: "➕ Add Channel", style: "primary" }],
  [{ text: "⬅️ Back to Force Channels", style: "primary" }]
];

var msg = "🗑️ <b>All Force Channels have been cleared!</b>";

if (request.data) {
  try { Api.deleteMessage({ message_id: request.message.message_id }); } catch (e) {}
}

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: clearForcePrimary, resize_keyboard: true }
});
