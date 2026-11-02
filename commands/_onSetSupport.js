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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

// Extract actual user input cleanly
var txt = "";
if (params && params.trim() !== "") {
  txt = params.trim();
} else if (request && request.message && request.message.text) {
  txt = request.message.text.trim();
} else {
  txt = Bot.getProperty("temp_last_text_" + user.telegramid, "");
}

// Strip command invocation if leaked
txt = txt.replace(/^\/onSetSupport\s*/i, "").trim();

if (!txt) return;

if (txt === "❌ Cancel" || txt === "/cancel" || txt.toLowerCase() === "cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

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
