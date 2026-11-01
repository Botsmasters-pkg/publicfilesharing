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

var sup = Bot.getProperty("supportContact", {
  username: "botadminshere",
  link: "https://t.me/botadminshere"
});

var txt = "📞 *Customer Support & Help Desk*\n`———————————————————————`\n\n" +
  "Need help with file upload, download, or bot features?\n\n" +
  "Reach out to our official support team below:";

var supLink = sup.link || (sup.username ? ("https://t.me/" + sup.username.replace("@", "")) : "https://t.me/botadminshere");

var keyb = [
  [{ text: "💬 Contact Support Directly", url: supLink }]
];

Api.sendMessage({
  text: txt,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
