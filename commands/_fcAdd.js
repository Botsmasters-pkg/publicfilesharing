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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

var msg = "➕ *Add Force Channel*\n`———————————————————————`\n\n" +
  "👉 *Select Channel Type:*\n\n" +
  "• *Public Channel:* Has public @username or t.me link.\n" +
  "• *Private Channel:* Uses chat ID (-100...) & invite link.\n" +
  "• *Private Request Channel:* Uses join request approval link.";

var keyb = [
  [
    { text: "📢 Public Channel", callback_data: "/fcStepType public" },
    { text: "🔒 Private Channel", callback_data: "/fcStepType private" }
  ],
  [
    { text: "📩 Private Request Channel", callback_data: "/fcStepType request" }
  ],
  [
    { text: "⬅️ Cancel & Back", callback_data: "/adminForceChannel" }
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
