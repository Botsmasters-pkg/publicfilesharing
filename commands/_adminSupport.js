/*CMD
  command: /adminSupport
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

var sup = Bot.getProperty("supportContact", {
  username: "botadminshere",
  link: "https://t.me/botadminshere"
});

var msg = "🆘 *Support Contact Settings*\n`———————————————————————`\n\n" +
  "• *Current Support Username:* @" + (sup.username || "None") + "\n" +
  "• *Current Support Link:* " + (sup.link || "None") + "\n\n" +
  "Normal users will see this contact when clicking the *🆘 Support* button.\n\n" +
  "👉 *To update:* Send the new Telegram Username (e.g. `@MySupport`) or Direct Link:";

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
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

Bot.run({ command: "/onSetSupport" });
