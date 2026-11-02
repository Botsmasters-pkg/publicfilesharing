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

var msg = "➕ *Add Force Channel*\n`———————————————————————`\n\n" +
  "👉 *Select Channel Type below:*\n\n" +
  "• *Public Channel:* Has public @username or t.me link.\n" +
  "• *Private Channel:* Uses chat ID (-100...) & invite link.\n" +
  "• *Private Request Channel:* Uses join request approval link.";

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
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { keyboard: fcAddPrimaryKeyboard, resize_keyboard: true }
});
