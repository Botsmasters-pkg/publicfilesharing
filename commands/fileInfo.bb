/*CMD
  command: /fileinfo_
  description: Show download traffic for a specific file (owner only)
  need_reply: false
*/
if (!params) return;
var fid=parseInt(params);
var uploads=Bot.getProperty('uploads','json');
var rec=uploads.find(o=>o.id===fid);
if (!rec){
  Bot.sendMessage('⚠️ File not found.');
  return;
}
if (rec.userId!==user.id && !user.is_admin){
  Bot.sendMessage('🚫 You are not allowed to view this file’s traffic.');
  return;
}
var logs=Bot.getProperty('downloadLogs','json')||[];
var fLogs=logs.filter(l=>l.fileId===fid);
var total=fLogs.length;
var uidSet=[...new Set(fLogs.map(l=>l.downloaderId))];
var detail='';
if(uidSet.length){
  detail='*Downloaders:*\n';
  uidSet.forEach(uid=>{
    var uInfo=Bot.getProperty('userInfo_'+uid,{username:'unknown'});
    detail+=`- ${uInfo.username||'User_'+uid} (ID:${uid})\n`;
  });
}else detail='_No downloads yet._';
var msg=`*File:* ${rec.originalName}\n*Total Downloads:* ${total}\n\n${detail}`;
Bot.sendMessage(msg,{parse_mode:'Markdown',disable_web_page_preview:true});
