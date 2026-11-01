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

var result = Bot.getProperty(user.telegramid + "" + params) || Bot.getProperty("file_" + params);
if (!result) {
  Bot.sendMessage("⚠️ *File not found or expired.*", { parse_mode: "Markdown" });
  return;
}

var uniqueId = result.file_unique_id || params;

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

Api.sendDocument({
  document: result.file_id,
  caption:
    "*🗂 File Info*\n`———————————————————————`\n📦 *File Name :* " +
    (result.file_name || "Document") +
    "\n📊 *File Size :* " +
    (result.file_size || "N/A") +
    "\n📁 *File Type :* " +
    (result.mime_type || "document"),
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: inlkey }
});
