/*CMD
  command: /onFcCustomTime
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

if (!message) return;

var txt = message.toLowerCase().trim();
var totalMinutes = 0;

var hoursMatch = txt.match(/(\d+)\s*h/);
var minsMatch = txt.match(/(\d+)\s*m/);
var daysMatch = txt.match(/(\d+)\s*d/);

if (hoursMatch) {
  totalMinutes += parseInt(hoursMatch[1]) * 60;
}
if (minsMatch) {
  totalMinutes += parseInt(minsMatch[1]);
}
if (daysMatch) {
  totalMinutes += parseInt(daysMatch[1]) * 1440;
}

if (!hoursMatch && !minsMatch && !daysMatch) {
  totalMinutes = parseInt(txt) || 60;
}

if (totalMinutes <= 0) totalMinutes = 60;

Bot.runCommand("/fcSetTime " + totalMinutes);

