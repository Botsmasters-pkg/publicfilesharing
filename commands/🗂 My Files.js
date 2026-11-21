/*CMD
  command: 🗂 My Files
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: /myfiles
  group: 
CMD*/

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
if (!userFiles || userFiles.length === 0) {
  var uList = User.getProperty("userFileList", []);
  if (uList && uList.length > 0) {
    userFiles = [];
    var botU = (Bot.getProperty("bot_username") || "bot").replace("@", "");
    for (var u = 0; u < uList.length; u++) {
      var itemKey = uList[u].file_unique_id || uList[u].uniqueKey || uList[u].fileUniqueId;
      var fileObj = Bot.getProperty("file_" + itemKey) || Bot.getProperty(user.telegramid + "" + itemKey) || {
        fileName: uList[u].file_name || "File",
        fileType: uList[u].file_type || "document",
        fileSize: "N/A",
        uniqueKey: itemKey,
        fileUniqueId: itemKey,
        userId: user.telegramid,
        status: "successful",
        uniqueLink: uList[u].uniqueLink || ("https://t.me/" + botU + "?start=" + itemKey)
      };
      userFiles.push(fileObj);
    }
  }
}

// Strict User Ownership: Only show successful uploads belonging to THIS user
var myFiles = [];
for (var k = 0; k < userFiles.length; k++) {
  if (userFiles[k].status === "successful" && userFiles[k].userId == user.telegramid) {
    myFiles.push(userFiles[k]);
  }
}

var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null);

if (!myFiles || myFiles.length === 0) {
  var emptyMsg = "📂 <b>My Files Dashboard</b>\n<code>———————————————————————</code>\n\n" +
    "You haven't uploaded any files yet.\n\n" +
    "👉 Click <b>📝 Upload Files</b> to upload single files, or <b>📦 Bulk Upload</b> to share multiple files at once!\n\n" +
    "<i>Every file you upload will appear here with its Unique Link and Personal Traffic Tracking.</i>";

  var emptyKey = [
    [
      { text: "📦 Bulk Upload", callback_data: "/createBatch", style: "primary" }
    ]
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

// Pagination Logic (5 files per page)
var pageSize = 5;
var totalPages = Math.max(1, Math.ceil(myFiles.length / pageSize));
var page = 1;
if (params) {
  var parsed = parseInt(params.trim());
  if (!isNaN(parsed) && parsed >= 1) {
    page = parsed;
  }
}
if (page > totalPages) page = totalPages;

var startIndex = (page - 1) * pageSize;
var pageFiles = myFiles.slice(startIndex, startIndex + pageSize);

var txt = "<b>🗂 My Files Dashboard</b> (Total: " + myFiles.length + " | Page " + page + "/" + totalPages + ")\n" +
  "<code>———————————————————————</code>\n\n";

var inlkey = [];

for (var i = 0; i < pageFiles.length; i++) {
  var file = pageFiles[i];
  var globalIndex = startIndex + i + 1;
  var itemKey = file.uniqueKey || file.fileUniqueId;
  var traffic = Bot.getProperty("traffic_" + itemKey, { count: 0 });
  var fType = (file.fileType || "document").toUpperCase();

  txt += "<b>" + globalIndex + ". " + escapeHtml(file.fileName) + "</b>\n";
  txt += "• Type: <code>" + escapeHtml(fType) + "</code> | Size: <code>" + escapeHtml(file.fileSize || "N/A") + "</code>\n";
  txt += "• Downloads: <b>" + (traffic.count || 0) + "</b>\n";
  txt += "• Link: <code>" + escapeHtml(file.uniqueLink) + "</code>\n\n";

  var shortName = file.fileName.length > 15 ? (file.fileName.slice(0, 15) + "...") : file.fileName;
  inlkey.push([
    {
      text: "📄 " + globalIndex + ". " + shortName,
      callback_data: "/fileinfo " + itemKey, style: "primary" },
    {
      text: "📊 Traffic (" + (traffic.count || 0) + ")",
      callback_data: "/fileTraffic " + itemKey, style: "primary" }
  ]);
}

// Pagination Navigation Buttons (Prev / Next)
if (totalPages > 1) {
  var navRow = [];
  if (page > 1) {
    navRow.push({ text: "⬅️ Prev", callback_data: "/myfiles " + (page - 1), style: "primary" });
  }
  navRow.push({ text: "📄 Page " + page + "/" + totalPages, callback_data: "/myfiles " + page, style: "primary" });
  if (page < totalPages) {
    navRow.push({ text: "Next ➡️", callback_data: "/myfiles " + (page + 1), style: "primary" });
  }
  inlkey.push(navRow);
}

// Action Bar: Search & Batches
inlkey.push([
  { text: "🔍 Search Files", callback_data: "/searchFilesPrompt", style: "primary" },
  { text: "📦 My Batches", callback_data: "/mybatches", style: "primary" }
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
