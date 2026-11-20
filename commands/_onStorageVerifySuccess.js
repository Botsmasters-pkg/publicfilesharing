/*CMD
  command: /onStorageVerifySuccess
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

// Delete test ping message immediately so the storage channel remains completely clean
if (options && options.result && options.result.message_id) {
  try {
    var targetChatId = (options.result.chat && options.result.chat.id) ? options.result.chat.id : candidateId;
    Api.deleteMessage({
      chat_id: targetChatId,
      message_id: options.result.message_id
    });
  } catch (e) {}
}

var chatObj = (options && options.result && options.result.chat) ? options.result.chat : null;
var chatType = chatObj ? chatObj.type : "";

// Strict Channel Verification: destination must be an actual Telegram Channel
if (chatType && chatType !== "channel") {
  // Reject non-channel entities (groups, supergroups, private chats)
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

  var prevStorage = Bot.getProperty("storageChannel", "-1004304151228");
  var invalidTypeMsg = "⚠️ <b>Invalid Destination Type!</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "• Target: <code>" + escapeHtml(candidateId) + "</code>\n" +
    "• Detected Type: <b>" + escapeHtml(chatType.toUpperCase()) + "</b>\n\n" +
    "❌ <b>Storage must be a Telegram Channel, not a group or chat!</b>\n\n" +
    "🛡️ <b>Security Safeguard:</b>\n" +
    "Your active storage channel (<code>" + escapeHtml(prevStorage) + "</code>) remains <b>unchanged</b>.";

  var errorKeyboard = [
    [{ text: "⚙️ Set New Storage Channel", style: "primary" }],
    [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
  ];

  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: invalidTypeMsg,
    parse_mode: "HTML",
    reply_markup: { keyboard: errorKeyboard, resize_keyboard: true }
  });
  return;
}

// Successful verification! Extract permanent ID, Title, and Username
var finalChannelId = candidateId;
if (chatObj && chatObj.id) {
  finalChannelId = chatObj.id.toString();
}
var channelTitle = (chatObj && chatObj.title) ? chatObj.title : finalChannelId;
var channelUsername = (chatObj && chatObj.username) ? ("@" + chatObj.username) : "";

// Save persistently to database
Bot.setProperty("storageChannel", finalChannelId, "string");
Bot.setProperty("storageChannelTitle", channelTitle, "string");
if (channelUsername) {
  Bot.setProperty("storageChannelUsername", channelUsername, "string");
}

// Clear admin waiting state
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var successMsg = "🎉 <b>Storage Channel Successfully Connected & Verified!</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Channel Name:</b> <b>" + escapeHtml(channelTitle) + "</b>\n" +
  "• <b>Channel ID:</b> <code>" + escapeHtml(finalChannelId) + "</code>\n" +
  (channelUsername ? ("• <b>Username:</b> " + escapeHtml(channelUsername) + "\n") : "") +
  "• <b>Bot Permissions:</b> 🟢 <b>Administrator (Verified)</b>\n" +
  "• <b>Status:</b> 🟢 <b>Active Storage Destination</b>\n\n" +
  "✅ <i>All future uploaded photos, videos, documents, and media will automatically be backed up to this channel!</i>";

var primaryKeyboard = [
  [{ text: "⚙️ Set New Storage Channel", style: "primary" }],
  [{ text: "🏷️ Storage Channel", style: "primary" }],
  [{ text: "⬅️ Back to Admin Panel", style: "primary" }]
];

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
});
