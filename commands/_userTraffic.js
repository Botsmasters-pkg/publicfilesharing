/*CMD
  command: /traffic
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 📊 Traffic, Traffic
  group: 
CMD*/

var userFileList = User.getProperty("userFileList", []);

var totalUserUploads = userFileList ? userFileList.length : 0;
var totalUserDownloads = 0;

var lines = [];
var inlkey = [];

for (var i = 0; i < totalUserUploads; i++) {
  var itemKey = userFileList[i].file_unique_id;
  var fileInfo = Bot.getProperty(user.telegramid + "" + itemKey) || Bot.getProperty("file_" + itemKey);
  var traffic = Bot.getProperty("traffic_" + itemKey, { count: 0 });
  var dlCount = traffic.count || 0;
  totalUserDownloads += dlCount;

  var fName = (fileInfo && fileInfo.file_name) ? fileInfo.file_name : ("File " + (i + 1));

  lines.push("• *" + (i + 1) + ". " + fName + "*\n  └ 📈 Downloads: *" + dlCount + "*");

  inlkey.push([
    { text: "📊 View Traffic #" + (i + 1) + " (" + dlCount + " DLs)", callback_data: "/fileTraffic " + itemKey }
  ]);
}

var txt = "📊 *Personal Download Traffic Dashboard*\n`———————————————————————`\n\n" +
  "👤 *Account:* " + (user.first_name || "User") + " (`#" + user.telegramid + "`)\n" +
  "📦 *Total Uploaded Files:* *" + totalUserUploads + "*\n" +
  "📈 *Total File Downloads:* *" + totalUserDownloads + "*\n\n";

if (totalUserUploads === 0) {
  txt += "_You have not uploaded any files yet._\n\nClick *Upload Files* below to start sharing and tracking your downloads!";
  inlkey.push([{ text: "📝 Upload Files", callback_data: "📝 Upload Files" }]);
} else {
  txt += "*📁 Your Uploaded Files Traffic:*\n" + lines.join("\n\n") + "\n\n" +
    "_Click any file button below to see the exact users who downloaded it._";
}

inlkey.push([{ text: "🗂 My Files", callback_data: "🗂 My Files" }]);

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: txt,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendMessage({
    text: txt,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
}
