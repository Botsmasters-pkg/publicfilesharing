/*CMD
  command: /cancelBatch
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

Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
Bot.setProperty("batch_temp_" + user.telegramid, [], "json");
Bot.setProperty("batch_caption_" + user.telegramid, "", "string");
Bot.setProperty("batch_msg_id_" + user.telegramid, null);
Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
var primaryKeyboard = [
  [
    { text: "📄 Single Upload", style: "primary" },
    { text: "📦 Bulk Upload", style: "primary" }
  ],
  [
    { text: "🗂 My Files", style: "primary" },
    { text: "📊 Traffic", style: "primary" }
  ],
  [
    { text: "🆘 Support", style: "primary" }
  ]
];
if (isAdmin) {
  primaryKeyboard.push([
    { text: "🛠 Admin Panel", style: "primary" }
  ]);
}

var msg = "❌ <b>Bulk upload cancelled.</b>\n\nNo link was generated.";

Api.sendMessage({
  chat_id: chatId,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
});
