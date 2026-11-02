/*CMD
  command: 🆘 Support
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: /support, /supportUser
  group: 
CMD*/

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var sup = Bot.getProperty("supportContact", {
  username: "botadminshere",
  link: "https://t.me/botadminshere"
});

var txt = "📞 <b>Customer Support &amp; Help Desk</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Need help with file upload, download, or bot features?\n\n" +
  "Reach out to our official support team below:";

var supLink = sup.link || (sup.username ? ("https://t.me/" + sup.username.replace("@", "")) : "https://t.me/botadminshere");

var keyb = [
  [{ text: "💬 Contact Support Directly", url: supLink, style: "primary" }]
];

Api.sendMessage({
  text: txt,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
