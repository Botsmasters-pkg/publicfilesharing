/*CMD
  command: /onGetBotUsername
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (options && options.result && options.result.username) {
  Bot.setProperty("bot_username", options.result.username, "string");
  Bot.setProperty("bot_id", options.result.id, "string");
  Bot.setProperty("bot_first_name", options.result.first_name, "string");
}

