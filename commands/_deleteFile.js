/*CMD
  command: /deleteFile
  help: 
  need_reply: 
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

var userFile = User.getProperty("userFileList")
for (var index in userFile) {
  var uniqueid = userFile[index].file_unique_id
  if (uniqueid == params) {
    userFile.splice(parseInt(index), 1)
  }
}
User.setProperty("userFileList", userFile, "json")
Bot.sendMessage("❌ File Has Been Deleted")
