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
  try {
    Api.deleteMessage({
      chat_id: request.message.chat.id,
      message_id: request.message.message_id
    });
  } catch (e) { }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
  Api.sendMessage({
    text: "📦 <b>File already exists in your list.</b>",
    parse_mode: "HTML"
  });
  return;
}

// Add to user file list
var fileEntry = {
  file_unique_id: result.file_unique_id,
  file_name: result.file_name || "File",
  file_type: result.file_type || "document"
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
var storageChannel = Bot.getProperty("storageChannel", "-1004304151228");
if (storageChannel) {
  try {
    var caption = "📦 <b>Storage Backup</b>\n" +
      "<code>———————————————————————</code>\n" +
      "<b>Name:</b> " + escapeHtml(result.file_name || "File") + "\n" +
      "<b>Size:</b> " + escapeHtml(result.file_size || "N/A") + "\n" +
      "<b>Owner:</b> <code>" + user.telegramid + "</code> (@" + escapeHtml(user.username || "None") + ")";
    if (result.file_type === "photo") {
      Api.sendPhoto({ chat_id: storageChannel, photo: result.file_id, caption: caption, parse_mode: "HTML" });
    } else if (result.file_type === "video") {
      Api.sendVideo({ chat_id: storageChannel, video: result.file_id, caption: caption, parse_mode: "HTML" });
    } else if (result.file_type === "audio") {
      Api.sendAudio({ chat_id: storageChannel, audio: result.file_id, caption: caption, parse_mode: "HTML" });
    } else {
      Api.sendDocument({ chat_id: storageChannel, document: result.file_id, caption: caption, parse_mode: "HTML" });
    }
  } catch (err) { }
}

var keyb = [
  [
    { text: "📂 View in My Files", callback_data: "/fileinfo " + result.file_unique_id, style: "primary" },
    { text: "➰ Share Link", callback_data: "/shareFile " + result.file_unique_id, style: "primary" }
  ]
];

Api.sendMessage({
  text: "✅ <b>File Successfully Saved To Database!</b>",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
