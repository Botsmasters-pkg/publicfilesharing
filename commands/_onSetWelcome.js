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
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

var wmObj = {
  type: "text",
  text: "",
  media: "",
  caption: ""
};

if (request.photo && request.photo.length > 0) {
  var p = request.photo[request.photo.length - 1];
  wmObj.type = "photo";
  wmObj.media = p.file_id;
  wmObj.caption = request.caption || "👋 Welcome to our Bot!";
} else if (request.video) {
  wmObj.type = "video";
  wmObj.media = request.video.file_id;
  wmObj.caption = request.caption || "👋 Welcome to our Bot!";
} else if (message) {
  wmObj.type = "text";
  wmObj.text = message.trim();
} else {
  Bot.sendMessage("⚠️ Please send valid text, photo, or video.");
  return;
}

Bot.setProperty("welcomeMessage", wmObj, "json");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Welcome Message Successfully Updated!*\n\nAll new and existing users will now see this when starting the bot.",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
