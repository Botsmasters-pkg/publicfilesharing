/*CMD
  command: /fcApplyTimer
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

if (!params) return;
var parts = params.trim().split(/\s+/);
var idx = parseInt(parts[0]);
var minutes = parseInt(parts[1]);

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

var ch = forceChannels[idx];
var msg = "";

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

if (minutes === 0) {
  ch.expiryTime = 0;
  ch.configuredMinutes = 0;
  ch.expired = false;

  msg = "✅ <b>Auto-Expiry Timer Removed!</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "• <b>Channel:</b> #" + (idx + 1) + " (<code>" + escapeHtml(ch.id) + "</code>)\n" +
    "• <b>Status:</b> 🟢 <b>Permanent (Active indefinitely)</b>\n\n" +
    "<i>This channel will never expire unless removed manually.</i>";
} else {
  var durationMs = minutes * 60 * 1000;
  ch.expiryTime = Date.now() + durationMs;
  ch.configuredMinutes = minutes;
  ch.expired = false;

  var durTxt = "";
  if (minutes >= 60) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    durTxt = h + " Hour" + (h > 1 ? "s" : "") + (m > 0 ? (" " + m + " Min" + (m > 1 ? "s" : "")) : "");
  } else {
    durTxt = minutes + " Minute" + (minutes > 1 ? "s" : "");
  }

  var expiryDateStr = new Date(ch.expiryTime).toISOString().slice(0, 16).replace("T", " ") + " UTC";

  msg = "✅ <b>Auto-Expiry Timer Set Successfully!</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "• <b>Channel:</b> #" + (idx + 1) + " (<code>" + escapeHtml(ch.id) + "</code>)\n" +
    "• <b>Duration:</b> <b>" + durTxt + "</b>\n" +
    "• <b>Expires At:</b> <code>" + expiryDateStr + "</code>\n\n" +
    "⚡ <i>The channel is now active. When the timer expires, it will automatically disappear from the user panel!</i>";
}

Bot.setProperty("forceChannels", forceChannels, "json");

var primaryKeyb = [
  [
    { text: "⏱️ Set Expiry Timer", style: "primary" },
    { text: "📄 List Channels", style: "primary" }
  ],
  [
    { text: "⬅️ Back to Force Channels", style: "primary" }
  ]
];

if (request.data) {
  try { Api.deleteMessage({ message_id: request.message.message_id }); } catch (e) {}
}

Api.sendMessage({
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: primaryKeyb, resize_keyboard: true }
});
