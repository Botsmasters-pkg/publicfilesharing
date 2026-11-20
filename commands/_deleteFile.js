/*CMD
  command: /deleteFile
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!params) return;

if (request.data) {
  try {
    Api.deleteMessage({
      chat_id: request.message.chat.id,
      message_id: request.message.message_id
    });
  } catch (e) {}
}

var uniqueId = params.trim();
var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
var filtered = [];
var found = false;

for (var i = 0; i < userFiles.length; i++) {
  var item = userFiles[i];
  if (item.fileUniqueId === uniqueId || item.uniqueKey === uniqueId || item.file_unique_id === uniqueId) {
    found = true;
  } else {
    filtered.push(item);
  }
}

try {
  Bot.setProperty("userFiles_" + user.telegramid, filtered, "json");
} catch (e) {}

// Also sync User.setProperty
var uList = User.getProperty("userFileList", []);
if (Array.isArray(uList)) {
  var filteredU = [];
  for (var j = 0; j < uList.length; j++) {
    var uj = uList[j];
    if (uj.fileUniqueId === uniqueId || uj.uniqueKey === uniqueId || uj.file_unique_id === uniqueId) {
      found = true;
    } else {
      filteredU.push(uj);
    }
  }
  try {
    User.setProperty("userFileList", filteredU, "json");
  } catch (e) {}
}

var backKey = [
  [{ text: "📂 Go to My Files", callback_data: "/myfiles", style: "primary" }]
];

if (found) {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: "🗑️ <b>File Deleted!</b>\n\nThe file has been permanently removed from your My Files dashboard.",
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: backKey }
  });
} else {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: "⚠️ <b>File was not found in your list.</b>",
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: backKey }
  });
}
