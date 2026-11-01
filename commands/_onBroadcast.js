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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (message === "❌ Cancel" || message === "/cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.sendMessage("Broadcast cancelled.");
  Bot.runCommand("/admin");
  return;
}

var allUsers = Bot.getProperty("allBotUsers", []);
if (!allUsers || allUsers.length === 0) {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.sendMessage("⚠️ No users found in database to broadcast.");
  return;
}

Bot.setProperty("admin_state_" + user.telegramid, "", "string");

var successCount = 0;
var failedCount = 0;

if (request.photo && request.photo.length > 0) {
  var photoId = request.photo[request.photo.length - 1].file_id;
  var cap = request.caption || "";
  for (var i = 0; i < allUsers.length; i++) {
    try {
      Api.sendPhoto({
        chat_id: allUsers[i],
        photo: photoId,
        caption: "📢 *Admin Announcement*\n`———————————————————————`\n\n" + cap,
        parse_mode: "Markdown"
      });
      successCount++;
    } catch (e) {
      failedCount++;
    }
  }
} else if (request.video) {
  var videoId = request.video.file_id;
  var vCap = request.caption || "";
  for (var k = 0; k < allUsers.length; k++) {
    try {
      Api.sendVideo({
        chat_id: allUsers[k],
        video: videoId,
        caption: "📢 *Admin Announcement*\n`———————————————————————`\n\n" + vCap,
        parse_mode: "Markdown"
      });
      successCount++;
    } catch (e) {
      failedCount++;
    }
  }
} else if (message) {
  for (var j = 0; j < allUsers.length; j++) {
    try {
      Api.sendMessage({
        chat_id: allUsers[j],
        text: "📢 *Admin Announcement*\n`———————————————————————`\n\n" + message,
        parse_mode: "Markdown"
      });
      successCount++;
    } catch (e) {
      failedCount++;
    }
  }
} else {
  return;
}

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "✅ *Broadcast Completed!*\n`———————————————————————`\n\n" +
    "• Delivered successfully: *" + successCount + "*\n" +
    "• Failed deliveries: *" + failedCount + "*\n" +
    "• Total Target Users: *" + allUsers.length + "*",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
