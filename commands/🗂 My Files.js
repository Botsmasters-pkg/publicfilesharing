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
  Bot.sendMessage("📂 *No files uploaded yet!*\n\n👉 Click *📝 Upload Files* below to upload your first file (Photo, Video, Document, etc.).\n\nOnce uploaded, you will see its *📊 Traffic* button right here to track downloads!", { parse_mode: "Markdown" });
  return;
}

var txt = "<b>🗂 Your Uploaded Files (" + userFileList.length + ")</b>\n<code>———————————————————————</code>\n\n";
var inlkey = [];

for (var i = 0; i < userFileList.length; i++) {
  var item = userFileList[i];
  var fileNum = i + 1;
  var fileData = Bot.getProperty(user.telegramid + "" + item.file_unique_id) || Bot.getProperty("file_" + item.file_unique_id) || item;
  var fileName = fileData.file_name || ("File " + fileNum);
  var traffic = Bot.getProperty("traffic_" + item.file_unique_id, { count: 0 });

  txt += "<b>" + fileNum + ". " + fileName + "</b>\n";
  txt += "• Downloads: <b>" + (traffic.count || 0) + "</b>\n";
  txt += "• ID: <code>" + item.file_unique_id + "</code>\n\n";

  inlkey.push([
    {
      text: "📄 File " + fileNum + " Info",
      callback_data: "/fileinfo " + item.file_unique_id
    },
    {
      text: "📊 Traffic (" + (traffic.count || 0) + ")",
      callback_data: "/fileTraffic " + item.file_unique_id
    }
  ]);
}

Api.sendMessage({
  text: txt,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
});
