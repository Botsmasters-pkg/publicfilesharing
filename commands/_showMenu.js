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

if (!user) return;

if (params && params.trim() !== "" && params.trim() !== "none") {
  Bot.runCommand("/downloadDirect " + params.trim());
  return;
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Primary Keyboard with style: "primary"
var primaryKeyboard = [
  [
    { text: "📝 Upload Files", style: "primary" },
    { text: "🗂 My Files", style: "primary" }
  ],
  [
    { text: "📊 Traffic", style: "primary" },
    { text: "🆘 Support", style: "primary" }
  ]
];
if (isAdmin) {
  primaryKeyboard.push([
    { text: "🛠 Admin Panel", style: "primary" }
  ]);
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
var wm = Bot.getProperty("welcomeMessage");
if (!wm || !wm.type || (wm.text && (wm.text.indexOf("/") === 0 || wm.text === "/onSetWelcome")) || (wm.caption && (wm.caption.indexOf("/") === 0 || wm.caption === "/onSetWelcome"))) {
  wm = { type: "text", text: "" };
  Bot.setProperty("welcomeMessage", null);
}

var defaultText = "👋 Hi " + uMention + (uHandle ? " (" + uHandle + ")" : "") + "!\n\n" +
  "I am *File Store Bot*. You can securely upload, store and share your files.\n\n" +
  "Choose an option below to get started:";

// Send single clean message with Primary Keyboard
if (wm.type === "photo" && wm.media) {
  var photoCap = (wm.caption && wm.caption.indexOf("/") !== 0) ? formatPlaceholders(wm.caption) : defaultText;
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: wm.media,
    caption: photoCap,
    parse_mode: "Markdown",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
  });
} else if (wm.type === "video" && wm.media) {
  var videoCap = (wm.caption && wm.caption.indexOf("/") !== 0) ? formatPlaceholders(wm.caption) : defaultText;
  Api.sendVideo({
    chat_id: user.telegramid,
    video: wm.media,
    caption: videoCap,
    parse_mode: "Markdown",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
  });
} else {
  var textMsg = (wm && wm.text && wm.text.indexOf("/") !== 0) ? formatPlaceholders(wm.text) : defaultText;
  Api.sendMessage({
    chat_id: user.telegramid,
    text: textMsg,
    parse_mode: "Markdown",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
  });
}
