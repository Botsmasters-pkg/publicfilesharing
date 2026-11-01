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
  aliases: /myfiles
  group: 
CMD*/

var userFiles = Bot.getProperty("userFiles_" + user.telegramid, []);

// Strict User Ownership: Only show successful uploads belonging to THIS user
var myFiles = [];
for (var k = 0; k < userFiles.length; k++) {
  if (userFiles[k].status === "successful" && userFiles[k].userId == user.telegramid) {
    myFiles.push(userFiles[k]);
  }
}

if (!myFiles || myFiles.length === 0) {
  var emptyMsg = "📂 *My Files Dashboard*\n`———————————————————————`\n\n" +
    "You haven't uploaded any files yet.\n\n" +
    "👉 Click *📝 Upload Files* below to upload your first file (Photos, Videos, Documents, Audio)!\n\n" +
    "_Every file you upload will appear here with its Unique Link and Personal Traffic Tracking._";

  if (request.data) {
    Api.editMessageText({
      message_id: request.message.message_id,
      text: emptyMsg,
      parse_mode: "Markdown"
    });
  } else {
    Bot.sendMessage(emptyMsg, { parse_mode: "Markdown" });
  }
  return;
}

var txt = "<b>🗂 My Files Dashboard (" + myFiles.length + ")</b>\n<code>———————————————————————</code>\n\n";
var inlkey = [];

for (var i = 0; i < myFiles.length; i++) {
  var file = myFiles[i];
  var fileNum = i + 1;
  var itemKey = file.uniqueKey || file.fileUniqueId;
  var traffic = Bot.getProperty("traffic_" + itemKey, { count: 0 });
  var fType = (file.fileType || "document").toUpperCase();

  txt += "<b>" + fileNum + ". " + file.fileName + "</b>\n";
  txt += "• Type: <code>" + fType + "</code> | Size: <code>" + (file.fileSize || "N/A") + "</code>\n";
  txt += "• Downloads: <b>" + (traffic.count || 0) + "</b>\n";
  txt += "• Link: <code>" + file.uniqueLink + "</code>\n\n";

  inlkey.push([
    {
      text: "📄 " + fileNum + ". " + (file.fileName.length > 15 ? (file.fileName.slice(0, 15) + "...") : file.fileName),
      callback_data: "/fileinfo " + itemKey
    },
    {
      text: "📊 Traffic (" + (traffic.count || 0) + ")",
      callback_data: "/fileTraffic " + itemKey
    }
  ]);
}

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendMessage({
    text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
}
