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
  if (params.trim().indexOf("batch_") === 0) {
    Bot.runCommand("/downloadBatch " + params.trim());
  } else {
    Bot.runCommand("/downloadDirect " + params.trim());
  }
  return;
}

// Reset any lingering batch or upload edit states when entering menu
Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
Bot.setProperty("batch_temp_" + user.telegramid, [], "json");
Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");
Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Primary Keyboard with style: "primary"
var primaryKeyboard = [
  [
    { text: "📝 Upload Files", style: "primary" },
    { text: "🗂 My Files", style: "primary" }
  ],
  [
    { text: "📦 Bulk Upload", style: "primary" },
    { text: "📊 Traffic", style: "primary" }
  ],
  [
    { text: "🆘 Support", style: "primary" }
  ]
];
if (isAdmin) {
  primaryKeyboard.push([
    { text: "🛠 Admin Panel", style: "primary" }
  ]);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";
var uHandle = user.username ? ("@" + user.username) : "";
var uMention = '<a href="tg://user?id=' + user.telegramid + '">' + escapeHtml(uFull) + '</a>';

function formatPlaceholders(text) {
  if (!text) return "";
  return text
    .replace(/\{name\}/gi, escapeHtml(uFull))
    .replace(/\{fullname\}/gi, escapeHtml(uFull))
    .replace(/\{first_name\}/gi, escapeHtml(uFirst || uFull))
    .replace(/\{last_name\}/gi, escapeHtml(uLast))
    .replace(/\{username\}/gi, escapeHtml(uHandle || uFull))
    .replace(/\{mention\}/gi, uMention)
    .replace(/\{id\}/gi, user.telegramid);
}

// Welcome Message (Admin Customizable: Text, Photo, or Video with dynamic placeholders)
var wm = Bot.getProperty("welcomeMessage");
if (typeof wm === "string") {
  wm = { type: "text", text: wm };
}
if (!wm || !wm.type || (wm.text && (wm.text.indexOf("/") === 0 || wm.text.indexOf("/onSetWelcome") !== -1)) || (wm.caption && (wm.caption.indexOf("/") === 0 || wm.caption.indexOf("/onSetWelcome") !== -1))) {
  wm = { type: "text", text: "" };
  Bot.setProperty("welcomeMessage", null);
}

var defaultText = "👋 Hi " + uMention + (uHandle ? " (" + escapeHtml(uHandle) + ")" : "") + "!\n\n" +
  "I am <b>File Store Bot</b>. You can securely upload, store and share your files.\n\n" +
  "Choose an option below to get started:";

// Send single clean message with Primary Keyboard in HTML mode
if (wm.type === "photo" && wm.media) {
  var photoCap = (wm.caption && wm.caption.indexOf("/") !== 0 && wm.caption.indexOf("/onSetWelcome") === -1) ? formatPlaceholders(wm.caption) : defaultText;
  Api.sendPhoto({
    chat_id: user.telegramid,
    photo: wm.media,
    caption: photoCap,
    parse_mode: "HTML",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
  });
} else if (wm.type === "video" && wm.media) {
  var videoCap = (wm.caption && wm.caption.indexOf("/") !== 0 && wm.caption.indexOf("/onSetWelcome") === -1) ? formatPlaceholders(wm.caption) : defaultText;
  Api.sendVideo({
    chat_id: user.telegramid,
    video: wm.media,
    caption: videoCap,
    parse_mode: "HTML",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
  });
} else {
  var textMsg = (wm && wm.text && wm.text.indexOf("/") !== 0 && wm.text.indexOf("/onSetWelcome") === -1) ? formatPlaceholders(wm.text) : defaultText;
  Api.sendMessage({
    chat_id: user.telegramid,
    text: textMsg,
    parse_mode: "HTML",
    reply_markup: { keyboard: primaryKeyboard, resize_keyboard: true }
  });
}
