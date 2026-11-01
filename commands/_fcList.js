/*CMD
  command: /fcList
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

var forceChannels = Bot.getProperty("forceChannels", []);
var now = Date.now();

if (!forceChannels || forceChannels.length === 0) {
  var emptyMsg = "📄 *Force Channels List*\n`———————————————————————`\n\n_No force channels configured yet._";
  var emptyKey = [
    [{ text: "➕ Add Channel", callback_data: "/fcAdd" }],
    [{ text: "⬅️ Back", callback_data: "/adminForceChannel" }]
  ];
  if (request.data) {
    Api.editMessageText({ message_id: request.message.message_id, text: emptyMsg, parse_mode: "Markdown", reply_markup: { inline_keyboard: emptyKey } });
  } else {
    Api.sendMessage({ text: emptyMsg, parse_mode: "Markdown", reply_markup: { inline_keyboard: emptyKey } });
  }
  return;
}

var txt = "📄 *Configured Force Channels (" + forceChannels.length + ")*\n`———————————————————————`\n\n";
var inlkey = [];

for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  var isExpired = ch.expired || (ch.expiryTime > 0 && now >= ch.expiryTime);
  if (isExpired && !ch.expired) {
    ch.expired = true;
  }

  var statusTxt = isExpired ? "🔴 EXPIRED" : "🟢 ACTIVE";
  var remainingTxt = "Permanent (No timer)";

  if (ch.expiryTime > 0) {
    if (isExpired) {
      remainingTxt = "Expired";
    } else {
      var remMs = ch.expiryTime - now;
      var remHours = Math.floor(remMs / (1000 * 60 * 60));
      var remMins = Math.floor((remMs % (1000 * 60 * 60)) / (1000 * 60));
      remainingTxt = remHours > 0 ? (remHours + "h " + remMins + "m left") : (remMins + " mins left");
    }
  }

  var expiryDateTxt = ch.expiryTime > 0 ? new Date(ch.expiryTime).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "Permanent";

  txt += "*" + (i + 1) + ". " + ch.id + "* (" + statusTxt + ")\n";
  txt += "• Type: `" + (ch.type ? ch.type.toUpperCase() : "PUBLIC") + "`\n";
  txt += "• Timer: *" + remainingTxt + "*\n";
  txt += "• Expiry: _" + expiryDateTxt + "_\n";
  if (ch.link) {
    txt += "• Link: " + ch.link + "\n";
  }
  txt += "\n";

  // Actions for this channel
  inlkey.push([
    { text: "⏱️ Timer " + (i + 1), callback_data: "/fcSelectTimer " + i },
    { text: "❌ Remove " + (i + 1), callback_data: "/fcRemovePrompt " + i }
  ]);
}

// Save any auto-expired updates
Bot.setProperty("forceChannels", forceChannels, "json");

inlkey.push([
  { text: "➕ Add Channel", callback_data: "/fcAdd" },
  { text: "⏱️ Set Expiry Timer", callback_data: "/fcTimerMenu" }
]);
inlkey.push([
  { text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }
]);

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: txt,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
} else {
  Api.sendMessage({
    text: txt,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: inlkey }
  });
}
