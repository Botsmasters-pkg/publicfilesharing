/*CMD
  command: /start
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

if (!params) {
  Bot.sendKeyboard(
    "📝 Upload Files,🗂 My Files\n",   "👋🏻 Hi ["+user.first_name+"](tg://user?id="+user.telegramid+")!\n\nI am File Store Bot, you can manage your files. by @botadminshere",
  {disable_web_page_preview: true,is_reply: true
})
  return
}
var id = params.slice(0, 10)
var fil = params.slice(10, 30)
var result = Bot.getProperty(id + "" + fil)
Api.sendDocument({
  document: result.file_id,
  caption:
    "*🗂File Info*\n`———————————————————————`\n📦File Name : *" +
    result.file_name +
    "*\n📊File Size : " +
    result.file_size +
    "\nFile Type : " +
    result.mime_type +
    "",
  parse_mode: "Markdown"
})

