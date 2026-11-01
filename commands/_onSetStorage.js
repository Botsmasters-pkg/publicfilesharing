/*CMD
  command: /onSetStorage
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

if (!message) return;

var text = message.trim();
if (text === "❌ Cancel" || text === "/cancel") {
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

Bot.setProperty("storageChannel", text, "string");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Storage Channel successfully set to:* `" + text + "`\n\nAll new uploads will automatically be backed up to this channel.",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});

