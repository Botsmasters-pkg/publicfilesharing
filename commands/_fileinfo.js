/*CMD
  command: /fileinfo
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var result = Bot.getProperty(user.telegramid + "" + params)

var inlkey = [
  [
    {
      text: "❌ Delete File",
      callback_data: "/deleteFile " + result.file_unique_id
    }
  ],
  [
    {
      text: "➰ Share File",
      callback_data: "/shareFile " + result.file_unique_id
    }
  ]
]
Api.sendDocument({
  document: result.file_id,
  caption:
    "*🗂File Info*\n`———————————————————————`\n📦File Name : *" +
    result.file_name +
    "*\n📊File Size : " +
    result.file_size +
    "\nFile Duration : " + 
    result.duration +
    "\nFile Type : " +
    result.mime_type +
    "",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: inlkey }
})

