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

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Api.getMe({
  on_result: "/onGetBotUsername"
});

var current = Bot.getProperty("bot_username") || (bot && bot.name) || "Detecting...";

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: "🔄 <b>Detecting Bot Username...</b>\n\n• Current: <b>@" + escapeHtml(current.replace("@", "")) + "</b>\n• Querying live Telegram API...\n\n<i>Bot username, ID, and identity refreshed directly from Telegram API!</i>",
  parse_mode: "HTML"
});
