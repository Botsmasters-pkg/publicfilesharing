/*CMD
  command: /uploadDocument
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
var result = Bot.getProperty(user.telegramid + "" + uniqueId) || Bot.getProperty("file_" + uniqueId);
if (!result) {
  Bot.sendMessage("⚠️ File expired or not found.");
  return;
}

var userFileList = User.getProperty("userFileList", []);
var exists = false;
for (var i = 0; i < userFileList.length; i++) {
  if (userFileList[i].file_unique_id === result.file_unique_id) {
    exists = true;
    break;
  }
}

if (exists) {
  Bot.sendMessage("📦 *File already exists in your list.*", { parse_mode: "Markdown" });
  return;
}

// Add to user file list
var fileEntry = {
  file_unique_id: result.file_unique_id,
  file_name: result.file_name || "Document"
};
userFileList.push(fileEntry);
User.setProperty("userFileList", userFileList, "json");

// Add to global files list
var allBotFiles = Bot.getProperty("allBotFiles", []);
if (allBotFiles.indexOf(result.file_unique_id) === -1) {
  allBotFiles.push(result.file_unique_id);
  Bot.setProperty("allBotFiles", allBotFiles, "json");
}
var totalCount = (Bot.getProperty("totalFilesCount", 0) || 0) + 1;
Bot.setProperty("totalFilesCount", totalCount, "integer");

// Forward to Storage Channel if configured
var storageChannel = Bot.getProperty("storageChannel");
if (storageChannel) {
  try {
    Api.sendDocument({
      chat_id: storageChannel,
      document: result.file_id,
      caption: "📦 *Storage Backup*\n`———————————————————————`\nName: *" + (result.file_name || "File") + "*\nSize: " + (result.file_size || "N/A") + "\nOwner: " + user.telegramid + " (@" + (user.username || "None") + ")",
      parse_mode: "Markdown"
    });
  } catch (err) {}
}

Bot.sendMessage("✅ *File Successfully Added To Database!*", { parse_mode: "Markdown" });
