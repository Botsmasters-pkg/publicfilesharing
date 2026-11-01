/*CMD
  command: /start
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// Save user to allBotUsers
var allUsers = Bot.getProperty("allBotUsers", []);
if (allUsers.indexOf(user.telegramid) === -1) {
  allUsers.push(user.telegramid);
  Bot.setProperty("allBotUsers", allUsers, "json");
}

// Save user info
Bot.setProperty("userInfo_" + user.telegramid, {
  id: user.telegramid,
  first_name: user.first_name || "",
  last_name: user.last_name || "",
  username: user.username || "",
  joined_at: new Date().toISOString()
}, "json");

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
var forceChannel = Bot.getProperty("forceChannel");

// Check Force Channel on bot start or download
if (forceChannel && !isAdmin) {
  var p = params ? params.trim() : "none";
  Api.getChatMember({
    chat_id: forceChannel,
    user_id: user.telegramid,
    on_result: "/onCheckJoin " + p,
    on_error: (p !== "none" ? "/downloadDirect " + p : "/showMenu")
  });
  return;
}

// If no force channel or user is admin:
if (!params) {
  var keyboard = "📝 Upload Files,🗂 My Files";
  if (isAdmin) {
    keyboard += "\n🛠 Admin Panel";
  }

  var customWelcome = Bot.getProperty("welcomeMessage");
  var welcomeText = customWelcome || ("👋 Hi [" + user.first_name + "](tg://user?id=" + user.telegramid + ")!\n\nI am File Store Bot. You can securely upload, store and share your files.\n\nChoose an option below to get started:");

  Bot.sendKeyboard(keyboard, welcomeText, {
    disable_web_page_preview: true,
    is_reply: true
  });
} else {
  Bot.runCommand("/downloadDirect " + params);
}
