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

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
if (!isAdmin) return;

if (!params) {
  Bot.sendMessage("⚠️ Please write the message to broadcast.\n_Example:_ `/broadcast Hello users!`", { parse_mode: "Markdown" });
  return;
}

var allUsers = Bot.getProperty("allBotUsers", []);
if (!allUsers || allUsers.length === 0) {
  Bot.sendMessage("⚠️ No users found in database to broadcast.");
  return;
}

var count = 0;
for (var i = 0; i < allUsers.length; i++) {
  try {
    Api.sendMessage({
      chat_id: allUsers[i],
      text: "📢 *Notification from Admin*\n`———————————————————————`\n\n" + params,
      parse_mode: "Markdown"
    });
    count++;
  } catch (e) {}
}

Bot.sendMessage("✅ *Broadcast Sent!*\nDelivered to *" + count + "* users.", { parse_mode: "Markdown" });
