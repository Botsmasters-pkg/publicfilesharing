/*CMD
  command: /adminStats
  description: Show global statistics (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin) return;

var uploads = Bot.getProperty('uploads','json')||[];
var users   = Bot.getProperty('allUserIds','json')||[];
var logs    = Bot.getProperty('downloadLogs','json')||[];

var totalFiles      = uploads.filter(o=>o.status==='successful').length;
var totalAttempts   = uploads.length;
var successful      = uploads.filter(o=>o.status==='successful').length;
var failed          = uploads.filter(o=>o.status==='failed').length;
var totalDownloads  = logs.length;
var successfulUsers = [...new Set(uploads.filter(o=>o.status==='successful').map(o=>o.userId))].length;
var failedUsers     = [...new Set(uploads.filter(o=>o.status==='failed').map(o=>o.userId))].length;

var txt = `*📈 Global Statistics*\n\n`;
txt+=`• Total Users: *${users.length}*\n`;
txt+=`• Total Files (successful): *${totalFiles}*\n`;
txt+=`• Total Upload Attempts: *${totalAttempts}*\n`;
txt+=`• Successful Uploads: *${successful}*\n`;
txt+=`• Failed Uploads: *${failed}*\n`;
txt+=`• Total Downloads: *${totalDownloads}*\n`;
txt+=`• Successful Users: *${successfulUsers}*\n`;
txt+=`• Failed Users: *${failedUsers}*\n`;

Bot.sendMessage(txt,{parse_mode:'Markdown'});
