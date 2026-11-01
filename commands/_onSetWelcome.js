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

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
if (!isAdmin) return;

if (!message) return;

var text = message.trim();
if (text === "❌ Cancel" || text === "/cancel") {
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

Bot.setProperty("welcomeMessage", text, "string");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Welcome Message successfully updated!*\n\nNew users will now see this message.",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});

