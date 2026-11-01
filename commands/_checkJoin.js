/*CMD
  command: /checkJoin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (request.data) {
  Api.deleteMessage({
    chat_id: request.message.chat.id,
    message_id: request.message.message_id
  });
}

var checkParam = (params && params.trim() !== "") ? params.trim() : "none";
var forceChannel = Bot.getProperty("forceChannel");

if (!forceChannel) {
  if (checkParam !== "none") {
    Bot.runCommand("/downloadDirect " + checkParam);
  } else {
    Bot.runCommand("/showMenu");
  }
  return;
}

Api.getChatMember({
  chat_id: forceChannel,
  user_id: user.telegramid,
  on_result: "/onCheckJoin " + checkParam,
  on_error: (checkParam !== "none" ? "/downloadDirect " + checkParam : "/showMenu")
});
