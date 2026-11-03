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
  var realUsername = options.result.username.replace("@", "").trim();
  Bot.setProperty("bot_username", realUsername, "string");
  Bot.setProperty("bot_id", options.result.id.toString(), "string");
  if (options.result.first_name) {
    Bot.setProperty("bot_first_name", options.result.first_name, "string");
  }
  if (bot && bot.id) {
    Bot.setProperty("bb_bot_id", bot.id, "integer");
  }
}
