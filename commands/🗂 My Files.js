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

var userFileList = User.getProperty("userFileList")
var txt = "<b>List Of Files</b>\n<code>———————————————————————</code>\n"
var inlkey = [[]]
var fileIndex
inlkey[1] = []
inlkey[2] = []
for (var index in userFileList) {
  var inlnum = parseInt(index) + 1
  fileIndex = userFileList[index]
  if(index <= 7){
    var keyboardRow = 0
  }
  if(index >= 7){
    var keyboardRow = 1
  }
  if(index >= 13){
    var keyboardRow = 2
  }
  inlkey[keyboardRow].push({
    text: inlnum,
    callback_data: "/fileinfo " + userFileList[index].file_unique_id
  })
}
if (!userFileList) {
  txt += "<b>No Files Found</b>"
}
if (userFileList) {
  for (var index in userFileList) {
    var file = userFileList[index].file_unique_id
    var ind = parseInt(index) + 1
    var fileInfo = Bot.getProperty(user.telegramid + "" + file)
    txt +=
      "" +
      ind +
      ", <b>" +
      fileInfo.file_name +
      "\n{" +
      fileInfo.file_unique_id +
      "}\n-------------------\n</b>"
  }
}
Api.sendMessage({
  text: txt,
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: inlkey }
})

