/*CMD
  command: /broadcast
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

if (!params) {
  Api.sendMessage({
    text: "⚠️ <b>Please write the message to broadcast.</b>\n<i>Example:</i> <code>/broadcast Hello users!</code>",
    parse_mode: "HTML"
  });
  return;
}

var allUsers = Bot.getProperty("allBotUsers", []);
if (!allUsers || allUsers.length === 0) {
  Api.sendMessage({
    text: "⚠️ <b>No users found in database to broadcast.</b>",
    parse_mode: "HTML"
  });
  return;
}

var count = 0;
for (var i = 0; i < allUsers.length; i++) {
  try {
    Api.sendMessage({
      chat_id: allUsers[i],
      text: "📢 <b>Notification from Admin</b>\n<code>———————————————————————</code>\n\n" + escapeHtml(params),
      parse_mode: "HTML"
    });
    count++;
  } catch (e) {}
}

Api.sendMessage({
  text: "✅ <b>Broadcast Sent!</b>\nDelivered to <b>" + count + "</b> users.",
  parse_mode: "HTML"
});
