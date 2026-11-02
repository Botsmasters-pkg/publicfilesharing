/*CMD
  command: /onSetWelcome
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
var text = "";
if (params && params.trim() !== "") {
  text = params.trim();
} else if (request && request.message && request.message.text) {
  text = request.message.text.trim();
} else {
  text = Bot.getProperty("temp_last_text_" + user.telegramid, "");
}

// Strip command invocation if leaked
text = text.replace(/^\/onSetWelcome\s*/i, "").trim();

if (text === "❌ Cancel" || text === "/cancel" || text.toLowerCase() === "cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("Welcome message customization cancelled.");
  Bot.runCommand("/admin");
  return;
}

if (text && text.indexOf("/") === 0) {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("⚠️ Command detected. Welcome text not changed. Please send plain text, photo, or video.");
  return;
}

var wm = {};

if (request.photo && request.photo.length > 0) {
  var photoId = request.photo[request.photo.length - 1].file_id;
  wm.type = "photo";
  wm.media = photoId;
  wm.caption = request.caption || text || "";
} else if (request.video) {
  wm.type = "video";
  wm.media = request.video.file_id;
  wm.caption = request.caption || text || "";
} else if (text) {
  wm.type = "text";
  wm.text = text;
} else {
  return;
}

Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
Bot.setProperty("welcomeMessage", wm, "json");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ <b>Welcome Message successfully updated!</b>\n\nNew users will now see your customized message when they start the bot.",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
