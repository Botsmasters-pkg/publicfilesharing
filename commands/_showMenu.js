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

// Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";
var uHandle = user.username ? ("@" + user.username) : "";
var uMention = "[" + uFull + "](tg://user?id=" + user.telegramid + ")";

function formatPlaceholders(text) {
  if (!text) return "";
  return text
    .replace(/\{name\}/gi, uFull)
    .replace(/\{fullname\}/gi, uFull)
    .replace(/\{first_name\}/gi, uFirst || uFull)
    .replace(/\{last_name\}/gi, uLast)
    .replace(/\{username\}/gi, uHandle || uFull)
    .replace(/\{mention\}/gi, uMention)
    .replace(/\{id\}/gi, user.telegramid);
}

// Welcome Message (Admin Customizable: Text, Photo, or Video with dynamic placeholders)
var wm = Bot.getProperty("welcomeMessage", {
  type: "text",
  text: "",
  media: "",
  caption: ""
});

var defaultText = "👋 Hi " + uMention + (uHandle ? " (" + uHandle + ")" : "") + "!\n\nI am File Store Bot. You can securely upload, store and share your files.\n\nChoose an option below to get started:";

// Send Keyboard
Bot.sendKeyboard(keyboard, "👇 Use the menu below to navigate:");

// Send Welcome Message
if (wm.type === "photo" && wm.media) {
  var photoCap = wm.caption ? formatPlaceholders(wm.caption) : defaultText;
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: wm.media,
    caption: photoCap,
    parse_mode: "Markdown"
  });
} else if (wm.type === "video" && wm.media) {
  var videoCap = wm.caption ? formatPlaceholders(wm.caption) : defaultText;
  Api.sendVideo({
    chat_id: user.telegramid,
    video: wm.media,
    caption: videoCap,
    parse_mode: "Markdown"
  });
} else {
  var welcomeText = wm.text ? formatPlaceholders(wm.text) : defaultText;
  Api.sendMessage({
    chat_id: user.telegramid,
    text: welcomeText,
    parse_mode: "Markdown",
    disable_web_page_preview: true
  });
}
