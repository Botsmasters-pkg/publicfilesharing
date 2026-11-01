/*CMD
  command: /onSetSupport
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

if (!message) return;

var txt = message.trim();
if (txt === "❌ Cancel" || txt === "/cancel") {
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

var cleanUsername = txt.replace("@", "").replace("https://t.me/", "");
var link = txt.indexOf("http") === 0 ? txt : ("https://t.me/" + cleanUsername);

var supObj = {
  username: cleanUsername,
  link: link
};

Bot.setProperty("supportContact", supObj, "json");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Support Contact Updated Successfully!*\n\n• Username: @" + cleanUsername + "\n• Link: " + link,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
