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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
text = text.replace(/^\/onSetStorage\s*/i, "").trim();

if (!text) return;

if (text === "❌ Cancel" || text === "/cancel" || text.toLowerCase() === "cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
Bot.setProperty("storageChannel", text, "string");

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ <b>Storage Channel successfully set to:</b> <code>" + escapeHtml(text) + "</code>\n\nAll new uploads will automatically be backed up to this channel.",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
