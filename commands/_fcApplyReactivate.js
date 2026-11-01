/*CMD
  command: /fcApplyReactivate
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
var minutes = parseInt(params);
var idx = Bot.getProperty("temp_reactivate_idx_" + user.telegramid, 0);

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

var now = Date.now();
forceChannels[idx].configuredMinutes = minutes;
forceChannels[idx].addedAt = now;
forceChannels[idx].expiryTime = minutes > 0 ? (now + minutes * 60 * 1000) : 0;
forceChannels[idx].expired = false; // Reactivated!

Bot.setProperty("forceChannels", forceChannels, "json");

var msg = "✅ *Channel Reactivated!*\n`———————————————————————`\n" +
  "Channel *" + forceChannels[idx].name + "* is now active again in the user panel for *" + (minutes > 0 ? (minutes + " mins") : "Permanent") + "*.";

var keyb = [
  [{ text: "📄 View Channels", callback_data: "/fcList" }],
  [{ text: "⬅️ Back", callback_data: "/adminForceChannel" }]
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
