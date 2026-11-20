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

if (!myFiles || myFiles.length === 0) {
  var emptyMsg = "📂 <b>My Files Dashboard</b>\n<code>———————————————————————</code>\n\n" +
    "You haven't uploaded any files yet.\n\n" +
    "👉 Click <b>📝 Upload Files</b> below to upload your first file (Photos, Videos, Documents, Audio)!\n\n" +
    "<i>Every file you upload will appear here with its Unique Link and Personal Traffic Tracking.</i>";

  if (request.data) {
    Api.editMessageText({
      message_id: request.message.message_id,
      text: emptyMsg,
      parse_mode: "HTML"
    });
  } else {
    Api.sendMessage({
      chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: emptyMsg,
      parse_mode: "HTML"
    });
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
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: txt,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: inlkey }
  });
}
