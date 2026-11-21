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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
var primaryKeyboard = [
  [
    { text: "📝 Upload Files", style: "primary" },
    { text: "🗂 My Files", style: "primary" }
  ],
  [
    { text: "📦 Bulk Upload", style: "primary" },
    { text: "📊 Traffic", style: "primary" }
  ],
  [
    { text: "🆘 Support", style: "primary" }
  ]
];
if (isAdmin) {
  primaryKeyboard.push([
    { text: "🛠 Admin Panel", style: "primary" }
  ]);
}

if (!bTemp || bTemp.length === 0) {
  var bulkKeyboard = [
    [
      { text: "✅ Done", style: "primary" },
      { text: "❌ Cancel", style: "primary" }
    ]
  ];
  Api.sendMessage({
    chat_id: chatId,
    text: "⚠️ <b>Abhi tak koi file upload nahi hui hai!</b>\n\nPehle files bhejein ya forward karein, phir <b>Done</b> dabayein.",
    parse_mode: "HTML",
    reply_markup: { keyboard: bulkKeyboard, resize_keyboard: true }
  });
  return;
}

var bCount = (Bot.getProperty("total_batches_count", 0) || 0) + 1;
Bot.setProperty("total_batches_count", bCount, "integer");

var rand = Math.random().toString(36).substring(2, 7);
var batchId = "batch_" + bCount + "_" + rand;

var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");
var batchLink = "https://t.me/" + botUsername + "?start=" + batchId;
var batchCaption = Bot.getProperty("batch_caption_" + user.telegramid, "");

var batchObj = {
  batchId: batchId,
  userId: user.telegramid,
  fileIds: bTemp,
  count: bTemp.length,
  caption: batchCaption ? batchCaption.trim() : "",
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

// Clear all batch temporary states
Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
Bot.setProperty("batch_temp_" + user.telegramid, [], "json");
Bot.setProperty("batch_caption_" + user.telegramid, "", "string");
Bot.setProperty("batch_msg_id_" + user.telegramid, null);
Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");

var captionBox = batchObj.caption && batchObj.caption.length > 0 ?
  ("📝 <b>Caption:</b>\n<blockquote>" + escapeHtml(batchObj.caption) + "</blockquote>\n\n") : "\n";

var successMsg = "🎉 <b>Bulk Upload Link Created Successfully!</b>\n" +
  "<code>———————————————————————</code>\n" +
  "📦 <b>Total Files:</b> <b>" + bTemp.length + " files</b>\n" +
  "📅 <b>Created At:</b> <i>" + batchObj.timestamp.slice(0, 19).replace('T', ' ') + "</i>\n" +
  captionBox +
  "🔗 <b>Shareable Bulk Download Link:</b>\n" +
  "<code>" + escapeHtml(batchLink) + "</code>\n\n" +
  "👉 <i>Anyone opening this single link will automatically receive all " + bTemp.length + " files in sequence!</i>";

var inlkey = [
  [
    { text: "📤 Share Bulk Link", url: "https://t.me/share/url?url=" + encodeURIComponent(batchLink) + "&text=" + encodeURIComponent("Download " + bTemp.length + " files bulk upload:"), style: "primary" }
  ],
  [
    { text: "✏️ Edit Caption", callback_data: "/editBatchCaption " + batchId, style: "primary" },
    { text: "📦 View My Batches", callback_data: "/mybatches", style: "primary" }
  ],
  [
    { text: "📂 Go to My Files", callback_data: "/myfiles 1", style: "primary" }
  ]
];

// Restore bottom keyboard
Api.sendMessage({
  chat_id: chatId,
  text: "🟢 <b>Bulk Upload Complete!</b>",
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
});

// Deliver the link card with inline buttons
Api.sendMessage({
  chat_id: chatId,
  text: successMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
