/*CMD
  command: /search
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

var query = (params || "").trim();
var chatId = (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : user.telegramid;

if (!query) {
  Bot.runCommand("/searchFilesPrompt");
  return;
}

var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
var matches = [];
var qLower = query.toLowerCase();

for (var i = 0; i < userFiles.length; i++) {
  var f = userFiles[i];
  if (f.status === "successful" && f.userId == user.telegramid) {
    var fName = (f.fileName || "").toLowerCase();
    var fType = (f.fileType || "").toLowerCase();
    var fCap = (f.caption || "").toLowerCase();
    if (fName.indexOf(qLower) !== -1 || fType.indexOf(qLower) !== -1 || fCap.indexOf(qLower) !== -1) {
      matches.push(f);
    }
  }
}

var inlkey = [];

if (matches.length === 0) {
  var noResultMsg = "🔍 <b>Search Results:</b> \"<code>" + escapeHtml(query) + "</code>\"\n" +
    "<code>———————————————————————</code>\n\n" +
    "❌ No matching files found in your uploads.\n\n" +
    "👉 Try searching with another keyword or return to your files.";

  inlkey.push([
    { text: "🔍 Search Again", callback_data: "/searchFilesPrompt", style: "primary" },
    { text: "📂 Go to My Files", callback_data: "/myfiles 1", style: "primary" }
  ]);

  if (request && request.data && request.message) {
    try {
      Api.editMessageText({
        chat_id: chatId,
        message_id: request.message.message_id,
        text: noResultMsg,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: inlkey }
      });
      return;
    } catch (e) {}
  }

  Api.sendMessage({
    chat_id: chatId,
    text: noResultMsg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
  return;
}

var resultMsg = "🔍 <b>Search Results:</b> \"<code>" + escapeHtml(query) + "</code>\" (" + matches.length + " found)\n" +
  "<code>———————————————————————</code>\n\n";

for (var j = 0; j < matches.length; j++) {
  var match = matches[j];
  var mNum = j + 1;
  var itemKey = match.uniqueKey || match.fileUniqueId;
  var traffic = Bot.getProperty("traffic_" + itemKey, { count: 0 });
  var mType = (match.fileType || "document").toUpperCase();

  resultMsg += "<b>" + mNum + ". " + escapeHtml(match.fileName) + "</b>\n";
  resultMsg += "• Type: <code>" + escapeHtml(mType) + "</code> | Size: <code>" + escapeHtml(match.fileSize || "N/A") + "</code>\n";
  resultMsg += "• Downloads: <b>" + (traffic.count || 0) + "</b>\n";
  resultMsg += "• Link: <code>" + escapeHtml(match.uniqueLink) + "</code>\n\n";

  var shortTitle = match.fileName.length > 15 ? (match.fileName.slice(0, 15) + "...") : match.fileName;
  inlkey.push([
    {
      text: "📄 " + mNum + ". " + shortTitle,
      callback_data: "/fileinfo " + itemKey
    },
    {
      text: "📊 Traffic (" + (traffic.count || 0) + ")",
      callback_data: "/fileTraffic " + itemKey
    }
  ]);
}

inlkey.push([
  { text: "🔍 Search Again", callback_data: "/searchFilesPrompt", style: "primary" },
  { text: "📂 Back to My Files", callback_data: "/myfiles 1", style: "primary" }
]);

if (request && request.data && request.message) {
  try {
    Api.editMessageText({
      chat_id: chatId,
      message_id: request.message.message_id,
      text: resultMsg,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: inlkey }
    });
    return;
  } catch (e) {}
}

Api.sendMessage({
  chat_id: chatId,
  text: resultMsg,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
