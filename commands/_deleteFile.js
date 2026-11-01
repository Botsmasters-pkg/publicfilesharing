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
  Api.deleteMessage({
    chat_id: request.message.chat.id,
    message_id: request.message.message_id
  });
}

var uniqueId = params.trim();
var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
var filtered = [];
var found = false;

for (var i = 0; i < userFiles.length; i++) {
  if (userFiles[i].fileUniqueId === uniqueId || userFiles[i].file_unique_id === uniqueId) {
    found = true;
  } else {
    filtered.push(userFiles[i]);
  }
}

Bot.setProperty("userFiles_" + user.telegramid, filtered, "json");
// Legacy
User.setProperty("userFileList", filtered, "json");

var backKey = [
  [{ text: "📂 Go to My Files", callback_data: "/myfiles" }]
];

if (found) {
  Api.sendMessage({
    text: "🗑️ *File Deleted!*\n\nThe file has been permanently removed from your My Files dashboard.",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: backKey }
  });
} else {
  Api.sendMessage({
    text: "⚠️ File was not found in your list.",
    reply_markup: { inline_keyboard: backKey }
  });
}
