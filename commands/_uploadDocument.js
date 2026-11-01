/*CMD
  command: /uploadDocument
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!params) {
  return
}
if (request.data) {
  var message_id = request.message.message_id
  var chat_id = request.message.chat.id

  Api.deleteMessage({
    chat_id: chat_id,
    message_id: message_id
  })
}
var result = Bot.getProperty(user.telegramid + "" + params)
var userFileList = User.getProperty("userFileList", [])
if (userFileList.length > 10) {
  Bot.sendMessage("Only 10 Files Per Account!")
  return
}
for (var index in userFileList) {
  var fileData = userFileList[index].file_unique_id
  if (fileData == result.file_unique_id) {
    var filteredData = "Already"
  }
}
if (filteredData == "Already") {
  Bot.sendMessage("📦 File Already Exists In DataBase")
  return
}
var jsonData = {}
jsonData.file_unique_id = result.file_unique_id
userFileList.push(jsonData)
User.setProperty("userFileList", userFileList, "json")
Bot.sendMessage("File Added To DataBase")

