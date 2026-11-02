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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

var current = Bot.getProperty("bot_username") || bot.name || "toxicfighterobot";

Api.getMe({
  on_result: "/onGetBotUsername"
});

Api.sendMessage({
  text: "🔄 <b>Detecting Bot Username...</b>\nCurrent: @" + current.replace("@", "") + "\n\n<i>Refreshed from Telegram API!</i>",
  parse_mode: "HTML"
});
