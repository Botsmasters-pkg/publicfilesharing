/*CMD
  command: /adminStorage
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

// Clear any dangling waiting state so input is not asked automatically upon opening
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var currentStorage = Bot.getProperty("storageChannel", "-1004304151228");

// Self-healing: if corrupted or invalid (e.g. '@https:'), heal to default
if (!currentStorage || currentStorage === "@https:" || currentStorage === "@" || currentStorage === "undefined" || currentStorage.indexOf("https:") !== -1) {
  currentStorage = "-1004304151228";
  Bot.setProperty("storageChannel", "-1004304151228", "string");
  Bot.setProperty("storageChannelTitle", "Primary System Storage", "string");
}

var storageTitle = Bot.getProperty("storageChannelTitle", "");
var isDefault = (currentStorage === "-1004304151228");

var msg = "📦 <b>Storage Channel Management</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Active Storage Channel:</b> <code>" + escapeHtml(currentStorage) + "</code>\n" +
  (storageTitle && !isDefault ? ("• <b>Channel Name:</b> <b>" + escapeHtml(storageTitle) + "</b>\n") : "") +
  "• <b>Channel Status:</b> 🟢 <b>Active &amp; Operational</b>\n" +
  "• <b>Configuration Mode:</b> " + (isDefault ? "<i>Default System Storage</i>" : "<b>Custom Storage Channel</b>") + "\n" +
  "• <b>Primary System Default:</b> <code>-1004304151228</code>\n\n" +
  "To connect a new storage channel with automatic permission verification, tap <b>⚙️ Set New Storage Channel</b> below:";

var keyb = [
  [{ text: "⚙️ Set New Storage Channel", callback_data: "/setNewStorage", style: "primary" }],
  [{ text: "🔄 Restore Default Storage", callback_data: "/resetStorageDefault", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin", style: "primary" }]
];

var storagePrimaryKeyboard = [
  [{ text: "⚙️ Set New Storage Channel", style: "primary" }],
  [{ text: "🔄 Restore Default Storage", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "HTML",
    reply_markup: { keyboard: storagePrimaryKeyboard, resize_keyboard: true }
  });
}
