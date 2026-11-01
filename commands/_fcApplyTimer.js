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

if (minutes === 0) {
  ch.expiryTime = 0;
  ch.configuredMinutes = 0;
  ch.expired = false;

  msg = "✅ *Auto-Expiry Timer Removed!*\n`———————————————————————`\n\n" +
    "• *Channel:* #" + (idx + 1) + " (`" + ch.id + "`)\n" +
    "• *Status:* 🟢 *Permanent (Active indefinitely)*\n\n" +
    "_This channel will never expire unless removed manually._";
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

  msg = "✅ *Auto-Expiry Timer Set Successfully!*\n`———————————————————————`\n\n" +
    "• *Channel:* #" + (idx + 1) + " (`" + ch.id + "`)\n" +
    "• *Duration:* *" + durTxt + "*\n" +
    "• *Expires At:* `" + expiryDateStr + "`\n\n" +
    "⚡ _The channel is now active. When the timer expires, it will automatically disappear from the user panel!_";
}

Bot.setProperty("forceChannels", forceChannels, "json");

var keyb = [
  [
    { text: "⏱️ Set Another Channel", callback_data: "/fcTimerMenu" },
    { text: "📄 View Channels", callback_data: "/fcList" }
  ],
  [
    { text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }
  ]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}

