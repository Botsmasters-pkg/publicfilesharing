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
var userFile = User.getProperty("userFileList", []);
var filtered = [];
var found = false;

for (var i = 0; i < userFile.length; i++) {
  if (userFile[i].file_unique_id === uniqueId) {
    found = true;
  } else {
    filtered.push(userFile[i]);
  }
}

User.setProperty("userFileList", filtered, "json");
Bot.setProperty(user.telegramid + "" + uniqueId, null);

if (found) {
  Bot.sendMessage("❌ *File has been deleted from your list.*", { parse_mode: "Markdown" });
} else {
  Bot.sendMessage("⚠️ File was already removed.");
}
