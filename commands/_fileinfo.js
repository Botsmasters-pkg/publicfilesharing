/*CMD
  command: /fileinfo
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

var uniqueId = params.trim();
var result = Bot.getProperty(user.telegramid + "" + uniqueId) || Bot.getProperty("file_" + uniqueId);
if (!result) {
  Bot.sendMessage("⚠️ *File not found or expired.*", { parse_mode: "Markdown" });
  return;
}

var inlkey = [
  [
    {
      text: "❌ Delete File",
      callback_data: "/deleteFile " + uniqueId
    },
    {
      text: "➰ Share File",
      callback_data: "/shareFile " + uniqueId
    }
  ],
  [
    {
      text: "📊 Traffic",
      callback_data: "/fileTraffic " + uniqueId
    }
  ]
];

var caption = "*🗂 File Info*\n`———————————————————————`\n📦 *File Name :* " +
  (result.file_name || "File") +
  "\n📊 *File Size :* " +
  (result.file_size || "N/A") +
  "\n📁 *File Type :* " +
  ((result.file_type || result.mime_type || "document").toUpperCase());

if (result.file_type === "photo") {
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: result.file_id,
    caption: caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
} else if (result.file_type === "video") {
  Api.sendVideo({
    chat_id: user.telegramid,
    video: result.file_id,
    caption: caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendDocument({
    chat_id: user.telegramid,
    document: result.file_id,
    caption: caption,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
}
