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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Extract actual user input cleanly
var bText = "";
if (params && params.trim() !== "") {
  bText = params.trim();
} else if (request && request.message && request.message.text) {
  bText = request.message.text.trim();
} else {
  bText = Bot.getProperty("temp_last_text_" + user.telegramid, "");
}

// Strip command invocation if leaked
bText = bText.replace(/^\/onBroadcast\s*/i, "").trim();

if (bText === "❌ Cancel" || bText === "/cancel" || bText.toLowerCase() === "cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("Broadcast cancelled.");
  Bot.runCommand("/admin");
  return;
}

var allUsers = Bot.getProperty("allBotUsers", []);
if (!allUsers || allUsers.length === 0) {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.sendMessage("⚠️ No users found in database to broadcast.");
  return;
}

// Clear admin waiting state
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var successCount = 0;
var failedCount = 0;

if (request.photo && request.photo.length > 0) {
  var photoId = request.photo[request.photo.length - 1].file_id;
  var cap = request.caption || bText || "";
  for (var i = 0; i < allUsers.length; i++) {
    try {
      Api.sendPhoto({
        chat_id: allUsers[i],
        photo: photoId,
        caption: "📢 <b>Admin Announcement</b>\n<code>———————————————————————</code>\n\n" + escapeHtml(cap),
        parse_mode: "HTML"
      });
      successCount++;
    } catch (e) {
      failedCount++;
    }
  }
} else if (request.video) {
  var videoId = request.video.file_id;
  var vCap = request.caption || bText || "";
  for (var k = 0; k < allUsers.length; k++) {
    try {
      Api.sendVideo({
        chat_id: allUsers[k],
        video: videoId,
        caption: "📢 <b>Admin Announcement</b>\n<code>———————————————————————</code>\n\n" + escapeHtml(vCap),
        parse_mode: "HTML"
      });
      successCount++;
    } catch (e) {
      failedCount++;
    }
  }
} else if (bText && bText.indexOf("/onBroadcast") === -1) {
  for (var j = 0; j < allUsers.length; j++) {
    try {
      Api.sendMessage({
        chat_id: allUsers[j],
        text: "📢 <b>Admin Announcement</b>\n<code>———————————————————————</code>\n\n" + escapeHtml(bText),
        parse_mode: "HTML"
      });
      successCount++;
    } catch (e) {
      failedCount++;
    }
  }
} else {
  Bot.sendMessage("⚠️ Please send text, photo, or video to broadcast.");
  return;
}

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin", style: "primary" }]
];

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: "✅ <b>Broadcast Completed!</b>\n<code>———————————————————————</code>\n\n" +
    "• Delivered successfully: <b>" + successCount + "</b>\n" +
    "• Failed deliveries: <b>" + failedCount + "</b>\n" +
    "• Total Target Users: <b>" + allUsers.length + "</b>",
  parse_mode: "HTML",
  reply_markup: { inline_keyboard: keyb }
});
