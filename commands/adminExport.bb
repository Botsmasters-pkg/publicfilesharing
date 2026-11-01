/*CMD
  command: /adminExport
  description: Export all user data as CSV (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin) return;
var ids = Bot.getProperty('allUserIds','json')||[];
var rows = ['UserID,Username,FirstName,LastName,Language,JoinedAt'];
ids.forEach(uid=>{
  var info = Bot.getProperty('userInfo_'+uid,{username:'',first_name:'',last_name:'',language_code:'',joined_at:''});
  rows.push([
    uid,
    `"${info.username||''}"`,
    `"${info.first_name||''}"`,
    `"${info.last_name||''}"`,
    `"${info.language_code||''}"`,
    `"${info.joined_at||''}"`
  ].join(','));
});
var csv = rows.join('\r\n');
Bot.sendDocument({
  chat_id:user.id,
  document:csv,
  filename:`users_${new Date().toISOString().replace(/[:.]/g,'_')}.csv`,
  caption:'🗂️ Users CSV Export'
});
