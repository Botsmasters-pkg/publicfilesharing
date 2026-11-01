/*CMD
  command: /download_
  description: Download a file (by internal ID) and log the event
  need_reply: false
*/
if (!params) return;
var fid=parseInt(params);
var uploads=Bot.getProperty('uploads','json');
var rec=uploads.find(o=>o.id===fid && o.status==='successful');
if(!rec){
  Bot.sendMessage('❗ File not available for download.');
  return;
}
try{
  Bot.sendDocument({chat_id:user.id, document:rec.link});
  var logs=Bot.getProperty('downloadLogs','json')||[];
  logs.push({fileId:fid, downloaderId:user.id, timestamp:new Date().toISOString(), ip:request.ip||''});
  Bot.setProperty('downloadLogs',logs,'json');
}catch(e){
  Bot.sendMessage('❌ Failed to send the file.');
}
