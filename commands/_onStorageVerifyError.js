/*CMD
  command: /onStorageVerifyError
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

var candidateId = (params || "").trim();

// Clear admin waiting state so user can retry cleanly
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var currentStorage = Bot.getProperty("storageChannel", "-1004304151228");

var errorDesc = "";
if (options && options.description) {
  errorDesc = options.description;
} else if (options && options.error) {
  errorDesc = options.error;
}

var failMsg = "❌ <b>Storage Channel Verification Failed!</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Could not access or verify: <code>" + escapeHtml(candidateId) + "</code>\n\n" +
  (errorDesc ? ("⚠️ <i>Telegram Error: " + escapeHtml(errorDesc) + "</i>\n\n") : "") +
  "👉 <b>Please ensure all prerequisites are met:</b>\n" +
  "1. Add this bot to the channel.\n" +
  "2. Promote the bot to <b>Administrator</b>.\n" +
  "3. Grant <b>Post Messages</b> permission.\n" +
  "4. Verify the channel ID or @username is correct.\n\n" +
  "🛡️ <b>Security Safeguard:</b>\n" +
  "• Active storage channel remains: <code>" + escapeHtml(currentStorage) + "</code>\n" +
  "• No settings were changed.";

var failKeyboard = [
  [{ text: "⚙️ Set New Storage Channel", style: "primary" }],
  [{ text: "🏷️ Storage Channel", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
];

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: failMsg,
  parse_mode: "HTML",
  reply_markup: { keyboard: failKeyboard, resize_keyboard: true }
});
