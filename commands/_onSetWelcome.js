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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (message === "❌ Cancel" || message === "/cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.sendMessage("Welcome message customization cancelled.");
  Bot.runCommand("/admin");
  return;
}

var wm = {};

if (request.photo && request.photo.length > 0) {
  var photoId = request.photo[request.photo.length - 1].file_id;
  wm.type = "photo";
  wm.media = photoId;
  wm.caption = request.caption || "";
} else if (request.video) {
  wm.type = "video";
  wm.media = request.video.file_id;
  wm.caption = request.caption || "";
} else if (message) {
  wm.type = "text";
  wm.text = message;
} else {
  return;
}

Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("welcomeMessage", wm, "json");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Welcome Message successfully updated!*\n\nNew users will now see your customized message when they start the bot.",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
