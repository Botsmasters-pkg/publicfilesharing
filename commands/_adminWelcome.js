/*CMD
  command: /adminWelcome
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

Bot.setProperty("admin_state_" + user.telegramid, "waiting_welcome", "string");

var wm = Bot.getProperty("welcomeMessage", {
  type: "text",
  text: "Default Welcome Message",
  media: "",
  caption: ""
});

var msg = "👋 *Custom Welcome Message Settings*\n`———————————————————————`\n\n" +
  "• *Type:* `" + (wm.type || "text").toUpperCase() + "`\n" +
  "• *Content:* " + (wm.text || wm.caption || "Default") + "\n\n" +
  "👉 *How to customize:*\n" +
  "• Send *Text* in chat to set as Welcome Text.\n" +
  "• Send a *Photo* (with optional caption) to set as Welcome Photo.\n" +
  "• Send a *Video* (with optional caption) to set as Welcome Video.";

var keyb = [
  [{ text: "🔄 Reset to Default Welcome", callback_data: "/clearWelcome" }],
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
