/*CMD
  command: 🗂 My Files
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

var userFileList = User.getProperty("userFileList", []);

if (!userFileList || userFileList.length === 0) {
  Bot.sendMessage("📂 *No files found in your storage.*\n\nClick *📝 Upload Files* to add a file!", { parse_mode: "Markdown" });
  return;
}

var txt = "<b>🗂 Your Uploaded Files</b>\n<code>———————————————————————</code>\n";
var inlkey = [];
var currentRow = [];

for (var i = 0; i < userFileList.length; i++) {
  var item = userFileList[i];
  var fileNum = i + 1;
  var fileData = Bot.getProperty(user.telegramid + "" + item.file_unique_id) || Bot.getProperty("file_" + item.file_unique_id) || item;
  var fileName = fileData.file_name || "File " + fileNum;

  txt += "<b>" + fileNum + ".</b> " + fileName + "\n<code>ID: " + item.file_unique_id + "</code>\n\n";

  currentRow.push({
    text: "📄 " + fileNum,
    callback_data: "/fileinfo " + item.file_unique_id
  });

  if (currentRow.length === 5) {
    inlkey.push(currentRow);
    currentRow = [];
  }
}

if (currentRow.length > 0) {
  inlkey.push(currentRow);
}

Api.sendMessage({
  text: txt,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
