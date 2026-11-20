/*CMD
  command: /mybatches
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
var userBatches = Bot.getProperty("userBatches_" + user.telegramid, []);

if (!userBatches || userBatches.length === 0) {
  var emptyMsg = "📦 <b>My Batches Dashboard</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "You haven't created any Batch Links yet.\n\n" +
    "👉 A <b>Batch Link</b> lets you bundle multiple files (episodes, PDFs, photos) into a single download link!\n\n" +
    "Click below to create your first Batch Link:";

  var emptyKey = [
    [{ text: "➕ Create Batch Link", callback_data: "/createBatch", style: "primary" }],
    [{ text: "📂 Back to My Files", callback_data: "/myfiles 1", style: "primary" }]
  ];

  if (request && request.data && request.message) {
    try {
      Api.editMessageText({
        chat_id: chatId,
        message_id: request.message.message_id,
        text: emptyMsg,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: emptyKey }
      });
      return;
    } catch (e) {}
  }

  Api.sendMessage({
    chat_id: chatId,
    text: emptyMsg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: emptyKey }
  });
  return;
}

var txt = "📦 <b>My Batches Dashboard (" + userBatches.length + ")</b>\n" +
  "<code>———————————————————————</code>\n\n";

var inlkey = [];

for (var i = 0; i < userBatches.length; i++) {
  var b = userBatches[i];
  var bNum = i + 1;
  var bTraffic = Bot.getProperty("traffic_" + b.batchId, { count: 0 });

  txt += "<b>" + bNum + ". Batch (" + b.count + " files)</b>\n";
  txt += "• Created: <i>" + escapeHtml(b.timestamp ? b.timestamp.slice(0, 19).replace('T', ' ') : "N/A") + "</i>\n";
  txt += "• Downloads: <b>" + (bTraffic.count || 0) + "</b>\n";
  txt += "• Link: <code>" + escapeHtml(b.uniqueLink) + "</code>\n\n";

  inlkey.push([
    {
      text: "📦 " + bNum + ". Batch (" + b.count + " files)",
      callback_data: "/batchinfo " + b.batchId
    },
    {
      text: "📤 Share",
      url: "https://t.me/share/url?url=" + encodeURIComponent(b.uniqueLink) + "&text=" + encodeURIComponent("Download " + b.count + " files batch:")
    }
  ]);
}

inlkey.push([
  { text: "➕ Create New Batch", callback_data: "/createBatch", style: "primary" },
  { text: "📂 Back to My Files", callback_data: "/myfiles 1", style: "primary" }
]);

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: txt,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlkey }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: txt,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
