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

if (params && params.trim() !== "" && params.trim() !== "none") {
  Bot.runCommand("/downloadDirect " + params.trim());
  return;
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

var keyboard = "📝 Upload Files,🗂 My Files\n🆘 Support";
if (isAdmin) {
  keyboard += "\n🛠 Admin Panel";
}

// Welcome Message (Admin Customizable: Text, Photo, or Video)
var wm = Bot.getProperty("welcomeMessage", {
  type: "text",
  text: "👋 Hi [" + (user.first_name || "User") + "](tg://user?id=" + user.telegramid + ")!\n\nI am File Store Bot. You can securely upload, store and share your files.\n\nChoose an option below to get started:",
  media: "",
  caption: ""
});

// Send Keyboard First
Bot.sendKeyboard(keyboard, "👇 Use the menu below to navigate:");

// Send Welcome Message
if (wm.type === "photo" && wm.media) {
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: wm.media,
    caption: wm.caption || wm.text || "👋 Welcome to File Store Bot!",
    parse_mode: "Markdown"
  });
} else if (wm.type === "video" && wm.media) {
  Api.sendVideo({
    chat_id: user.telegramid,
    video: wm.media,
    caption: wm.caption || wm.text || "👋 Welcome to File Store Bot!",
    parse_mode: "Markdown"
  });
} else {
  var welcomeText = wm.text || ("👋 Hi [" + (user.first_name || "User") + "](tg://user?id=" + user.telegramid + ")!\n\nI am File Store Bot. You can securely upload, store and share your files.\n\nChoose an option below to get started:");
  Api.sendMessage({
    chat_id: user.telegramid,
    text: welcomeText,
    parse_mode: "Markdown",
    disable_web_page_preview: true
  });
}
