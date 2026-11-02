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

var text = "";
if (request && request.message && request.message.forward_from_chat) {
  text = request.message.forward_from_chat.id.toString();
} else if (params && params.trim() !== "") {
  text = params.trim();
} else if (request && request.message && request.message.text) {
  text = request.message.text.trim();
} else {
  text = Bot.getProperty("temp_last_text_" + user.telegramid, "");
}

text = text.replace(/^\/onSetStorage\s*/i, "").trim();

if (!text) return;

if (text === "❌ Cancel" || text === "/cancel" || text.toLowerCase() === "cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("Action cancelled.");
  Bot.runCommand("/admin");
  return;
}

if (text === "🔄 Reset to Default Storage" || text === "/resetStorageDefault") {
  Bot.runCommand("/resetStorageDefault");
  return;
}

// Format channel identifier cleanly
var cleanStorage = text;
if (cleanStorage.indexOf("http") === 0 || cleanStorage.indexOf("t.me/") !== -1) {
  var cleanUser = cleanStorage.replace(/https?:\/\/t\.me\//i, "").replace("@", "").replace(/\/.*/, "").trim();
  cleanStorage = "@" + cleanUser;
} else if (cleanStorage.match(/^-?\d+$/)) {
  // If numeric ID
  if (!cleanStorage.startsWith("-")) {
    cleanStorage = "-100" + cleanStorage.replace(/^100/, "");
  } else if (!cleanStorage.startsWith("-100") && cleanStorage.length > 7) {
    cleanStorage = "-100" + cleanStorage.replace(/^-/, "");
  }
} else if (!cleanStorage.startsWith("@") && !cleanStorage.startsWith("-")) {
  cleanStorage = "@" + cleanStorage;
}

Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
Bot.setProperty("storageChannel", cleanStorage, "string");

var storagePrimaryKeyboard = [
  [{ text: "🏷️ Storage Channel", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
];

Api.sendMessage({
  text: "✅ <b>Storage Channel Successfully Set!</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "• <b>Storage Channel ID:</b> <code>" + escapeHtml(cleanStorage) + "</code>\n\n" +
    "All uploaded files, photos, videos, and documents will automatically be backed up to this channel.\n\n" +
    "<i>(Ensure the bot is an Administrator in that channel with 'Post Messages' permission)</i>",
  parse_mode: "HTML",
  reply_markup: { keyboard: storagePrimaryKeyboard, resize_keyboard: true }
});
