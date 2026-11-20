/*CMD
  command: /fcAdd
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

var msg = "➕ <b>Add Force Channel</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "👉 <b>Select Channel Type below:</b>\n\n" +
  "• <b>Public Channel:</b> Has public @username or t.me link.\n" +
  "• <b>Private Channel:</b> Uses chat ID (-100...) &amp; invite link.\n" +
  "• <b>Private Request Channel:</b> Uses join request approval link.";

var fcAddPrimaryKeyboard = [
  [
    { text: "📢 Public Channel", style: "primary" },
    { text: "🔒 Private Channel", style: "primary" }
  ],
  [
    { text: "📩 Private Request Channel", style: "primary" }
  ],
  [
    { text: "⬅️ Cancel & Back", style: "primary" }
  ]
];

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: fcAddPrimaryKeyboard, resize_keyboard: true }
});
