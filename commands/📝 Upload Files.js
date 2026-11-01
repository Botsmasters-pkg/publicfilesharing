/*CMD
  command: 📝 Upload Files
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: Send The File You Want To Upload In The Bot!

  keyboard: 
  aliases: 
  group: 
CMD*/

if (!request.document) {
Bot.sendMessage("We Only Support Files For Now")
  return
}
Bot.setProperty(user.telegramid + "" + request.document.file_unique_id, request.document, "json")
var keyb = [
  [
    {
      text: "📪 Upload To Server",
      callback_data: "/uploadDocument " + request.document.file_unique_id
    }
  ]
]

Api.sendMessage({
  text:
    "*🗂File Info*\n`———————————————————————`\n📦File Name : *" +
    request.document.file_name +
    "*\n📊File Size : " +
    request.document.file_size +
    "\nFile Duration : " + 
    request.document.duration +
    "\nFile Type : " +
    request.document.mime_type +
    "",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
})

