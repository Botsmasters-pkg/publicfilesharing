/*CMD
  command: /setUploadSingle
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
Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");
Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

var targetChat = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

var msg = "📄 <b>Single Upload Mode Active</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Ab aap koi bhi file, photo, video, document, ya audio yahan bhejein ya kisi channel se forward karein.\n\n" +
  "💡 <i>Har file ka turant apna alag unique download link banega! (Agar aap ek sath multiple files bhi forward karenge to sabhi ka alag-alag link milega).</i>";

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: targetChat,
      message_id: request.message.message_id,
      text: msg,
      parse_mode: "HTML"
    });
    return;
  } catch (e) {}
}

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

Api.sendMessage({
  chat_id: targetChat,
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
});
