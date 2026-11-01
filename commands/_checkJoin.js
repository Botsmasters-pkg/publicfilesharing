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

if (!params) return;

if (request.data) {
  Api.deleteMessage({
    chat_id: request.message.chat.id,
    message_id: request.message.message_id
  });
}

var forceChannel = Bot.getProperty("forceChannel");
if (!forceChannel) {
  Bot.runCommand("/downloadDirect " + params);
  return;
}

Api.getChatMember({
  chat_id: forceChannel,
  user_id: user.telegramid,
  on_result: "/onCheckJoin " + params,
  on_error: "/downloadDirect " + params
});

