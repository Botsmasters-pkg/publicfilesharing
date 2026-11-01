/*CMD
  command: chat_join_request
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: /chat_join_request
  group: 
CMD*/

if (request && request.chat_join_request) {
  var cId = request.chat_join_request.chat.id;
  var uId = request.chat_join_request.from.id;
  Bot.setProperty("join_req_" + cId + "_" + uId, true, "boolean");

  // Automatically approve join request on Telegram
  Api.approveChatJoinRequest({
    chat_id: cId,
    user_id: uId
  });
}

