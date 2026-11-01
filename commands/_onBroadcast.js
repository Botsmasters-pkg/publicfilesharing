/*CMD
  command: /onBroadcast
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

var allUsers = Bot.getProperty("allBotUsers", []);
if (!allUsers || allUsers.length === 0) {
  Bot.sendMessage("⚠️ No users found in database to broadcast.");
  return;
}

if (message === "❌ Cancel" || message === "/cancel") {
  Bot.sendMessage("Broadcast cancelled.");
  Bot.runCommand("/admin");
  return;
}

var count = 0;

if (request.photo && request.photo.length > 0) {
  var photoId = request.photo[request.photo.length - 1].file_id;
  var cap = request.caption || "";
  for (var i = 0; i < allUsers.length; i++) {
    try {
      Api.sendPhoto({
        chat_id: allUsers[i],
        photo: photoId,
        caption: "📢 *Notification from Admin*\n`———————————————————————`\n\n" + cap,
        parse_mode: "Markdown"
      });
      count++;
    } catch (e) {}
  }
} else if (message) {
  for (var j = 0; j < allUsers.length; j++) {
    try {
      Api.sendMessage({
        chat_id: allUsers[j],
        text: "📢 *Notification from Admin*\n`———————————————————————`\n\n" + message,
        parse_mode: "Markdown"
      });
      count++;
    } catch (e) {}
  }
}

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Broadcast Sent Successfully!*\nDelivered to *" + count + "* users.",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});

