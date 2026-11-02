/*CMD
  command: /fcCustomTimer
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
var idx = parseInt(params.trim());

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var ch = forceChannels[idx];
Bot.setProperty("temp_fc_custom_idx_" + user.telegramid, idx, "integer");
Bot.setProperty("admin_state_" + user.telegramid, "waiting_custom_timer", "string");

var msg = "⏳ <b>Custom Auto-Expiry Timer</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "Configure custom timer for Channel #" + (idx + 1) + " (<code>" + escapeHtml(ch.id) + "</code>)\n\n" +
  "👉 <b>Send custom duration in chat:</b>\n\n" +
  "<i>Valid formats:</i>\n" +
  "• <code>45m</code> (45 Minutes)\n" +
  "• <code>3h</code> (3 Hours)\n" +
  "• <code>2h 30m</code> (2 Hours 30 Minutes)\n" +
  "• <code>1d</code> (1 Day / 24 Hours)\n" +
  "• <code>90</code> (90 Minutes)\n\n" +
  "Send your desired duration now:";

var keyb = [
  [{ text: "⬅️ Cancel", callback_data: "/fcSelectTimer " + idx }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
}
