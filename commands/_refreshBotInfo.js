/*CMD
  command: /refreshBotInfo
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

Api.getMe({
  on_result: "/onGetBotUsername"
});

var current = Bot.getProperty("bot_username", bot.name);
Bot.sendMessage("🔄 *Detecting Bot Username...*\nCurrent: @" + current + "\n\n_Refreshed from Telegram API!_", { parse_mode: "Markdown" });
