/*CMD
  command: /showMenu
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
