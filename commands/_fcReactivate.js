/*CMD
  command: /fcReactivate
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
var idx = parseInt(params);

var forceChannels = Bot.getProperty("forceChannels", []);
if (!forceChannels[idx]) {
  Bot.sendMessage("⚠️ Channel not found.");
  return;
}

var ch = forceChannels[idx];
Bot.setProperty("temp_reactivate_idx_" + user.telegramid, idx, "integer");

var msg = "🔄 *Reactivate Channel:* *" + ch.name + "*\n`———————————————————————`\n\n" +
  "👉 *Select New Active Time:*\n" +
  "_The timer will start immediately from now, and the channel will reappear in the user panel._";

var keyb = [
  [
    { text: "⏱ 5 Minutes", callback_data: "/fcApplyReactivate 5" },
    { text: "⏱ 10 Minutes", callback_data: "/fcApplyReactivate 10" }
  ],
  [
    { text: "⏱ 15 Minutes", callback_data: "/fcApplyReactivate 15" },
    { text: "⏱ 30 Minutes", callback_data: "/fcApplyReactivate 30" }
  ],
  [
    { text: "⏱ 1 Hour", callback_data: "/fcApplyReactivate 60" },
    { text: "⏱ 2 Hours", callback_data: "/fcApplyReactivate 120" }
  ],
  [
    { text: "⏱ 6 Hours", callback_data: "/fcApplyReactivate 360" },
    { text: "⏱ 12 Hours", callback_data: "/fcApplyReactivate 720" }
  ],
  [
    { text: "⏱ 24 Hours", callback_data: "/fcApplyReactivate 1440" },
    { text: "♾ Permanent", callback_data: "/fcApplyReactivate 0" }
  ],
  [
    { text: "⬅️ Cancel", callback_data: "/fcList" }
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
