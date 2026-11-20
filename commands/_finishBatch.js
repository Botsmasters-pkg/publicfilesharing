/*CMD
  command: /finishBatch
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

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;
var bTemp = Bot.getProperty("batch_temp_" + user.telegramid, []);

if (!bTemp || bTemp.length === 0) {
  var emptyAlert = "⚠️ <b>No files in batch!</b>\n\nPlease send or forward at least 1 file first before finishing.";
  var emptyKey = [
    [{ text: "❌ Cancel Batch", callback_data: "/cancelBatch", style: "primary" }]
  ];
  if (request && request.data && request.message) {
    try {
      Api.editMessageText({
        chat_id: chatId,
        message_id: request.message.message_id,
        text: emptyAlert,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: emptyKey }
      });
      return;
    } catch (e) {}
  }
  Api.sendMessage({
    chat_id: chatId,
    text: emptyAlert,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: emptyKey }
  });
  return;
}

var bCount = (Bot.getProperty("total_batches_count", 0) || 0) + 1;
Bot.setProperty("total_batches_count", bCount, "integer");

var rand = Math.random().toString(36).substring(2, 7);
var batchId = "batch_" + bCount + "_" + rand;

var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");
var batchLink = "https://t.me/" + botUsername + "?start=" + batchId;

var batchObj = {
  batchId: batchId,
  userId: user.telegramid,
  fileIds: bTemp,
  count: bTemp.length,
  timestamp: new Date().toISOString(),
  uniqueLink: batchLink
};

Bot.setProperty("batch_" + batchId, batchObj, "json");

// Save to userBatches safely capped
var userBatches = Bot.getProperty("userBatches_" + user.telegramid, []);
if (!Array.isArray(userBatches)) userBatches = [];
userBatches.unshift(batchObj);
if (userBatches.length > 20) {
  userBatches = userBatches.slice(0, 20);
}
Bot.setProperty("userBatches_" + user.telegramid, userBatches, "json");

// Clear batch state
Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
Bot.setProperty("batch_temp_" + user.telegramid, [], "json");

var successMsg = "🎉 <b>Batch Link Created Successfully!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>Total Files in Batch:</b> <b>" + bTemp.length + "</b>\n" +
  "📅 <b>Created At:</b> <i>" + batchObj.timestamp.slice(0, 19).replace('T', ' ') + "</i>\n\n" +
  "🔗 <b>Shareable Batch Link:</b>\n" +
  "<code>" + escapeHtml(batchLink) + "</code>\n\n" +
  "👉 <i>Anyone opening this single link will automatically receive all " + bTemp.length + " files in sequence!</i>";

var inlkey = [
  [
    { text: "📤 Share Batch Link", url: "https://t.me/share/url?url=" + encodeURIComponent(batchLink) + "&text=" + encodeURIComponent("Download " + bTemp.length + " files batch:"), style: "primary" }
  ],
  [
    { text: "📦 View My Batches", callback_data: "/mybatches", style: "primary" },
    { text: "📂 Go to My Files", callback_data: "/myfiles 1", style: "primary" }
  ]
];

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: successMsg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlkey }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
