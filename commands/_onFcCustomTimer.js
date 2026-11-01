/*CMD
  command: /onFcCustomTimer
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (!message) return;
var text = message.trim().toLowerCase();
var idx = Bot.getProperty("temp_fc_custom_idx_" + user.telegramid, 0);

if (text === "/cancel" || text === "cancel" || text === "❌ cancel") {
  Bot.sendMessage("❌ Custom timer cancelled.");
  Bot.runCommand("/fcSelectTimer " + idx);
  return;
}

var totalMinutes = 0;

// Match days (e.g. 2d)
var dayMatch = text.match(/(\d+)\s*d/);
if (dayMatch) {
  totalMinutes += parseInt(dayMatch[1]) * 1440;
}

// Match hours (e.g. 3h)
var hourMatch = text.match(/(\d+)\s*h/);
if (hourMatch) {
  totalMinutes += parseInt(hourMatch[1]) * 60;
}

// Match minutes (e.g. 45m)
var minMatch = text.match(/(\d+)\s*m/);
if (minMatch) {
  totalMinutes += parseInt(minMatch[1]);
}

// If just raw number (e.g. 120)
if (!dayMatch && !hourMatch && !minMatch) {
  var rawNum = parseInt(text);
  if (!isNaN(rawNum) && rawNum > 0) {
    totalMinutes = rawNum;
  }
}

if (totalMinutes <= 0) {
  Bot.sendMessage("⚠️ Invalid format! Please enter valid duration like `45m`, `2h`, `1h 30m`, or `1d`.\n_Or send /cancel to exit._");
  Bot.run({ command: "/onFcCustomTimer" });
  return;
}

Bot.runCommand("/fcApplyTimer " + idx + " " + totalMinutes);
