/*CMD
  command: /uploadDocument
  description: Accept any file, forward to storage channel, create link, save record
  need_reply: false
*/
if (!params) return;               // Bot receives file_id → params holds it

// ---- 1️⃣ Retrieve file info stored by Bot ----
var fileInfo = Bot.getProperty(user.telegramid+''+params);
if (!fileInfo){
  Bot.sendMessage('⚠️ File info not found.');
  return;
}

// ---- 2️⃣ Load storage channel config (default if missing) ----
var cfg = Bot.getProperty('storageChannelConfig', {
  defaultChannelId: '-1004304151228',
  currentChannelId: '-1004304151228'
});
var channelId = cfg.currentChannelId;

// ---- 3️⃣ provisional DB entry (status = failed) ----
var uploads = Bot.getProperty('uploads', []);   // array of objects
var newId = uploads.length? uploads[uploads.length-1].id+1 : 1;
uploads.push({
  id:newId,
  userId:user.id,
  fileUniqueId:fileInfo.file_unique_id,
  originalName:fileInfo.file_name||'unknown',
  storageChannelId:channelId,
  status:'failed',
  link:'',
  timestamp:new Date().toISOString()
});
Bot.setProperty('uploads', uploads, 'json');

// ---- 4️⃣ Forward to storage channel ----
try{
  var fwd = Bot.sendDocument({
    chat_id: channelId,
    document:fileInfo.file_id,
    caption:'📁 Uploaded by @'+(user.username||user.first_name)
  });
  var msgId = fwd.message_id;
  var link = 'https://t.me/c/'+Math.abs(parseInt(channelId))+'/'+msgId;

  // ---- 5️⃣ Update DB entry to SUCCESS ----
  uploads = Bot.getProperty('uploads','json');
  var rec = uploads.find(o=>o.id===newId);
  if(rec){
    rec.status='successful';
    rec.link=link;
    Bot.setProperty('uploads', uploads, 'json');
  }

  // ---- 6️⃣ Add to user‑specific file list (My Files) ----
  var userList = Bot.getProperty('userFiles_'+user.id, []);
  userList.push({fileId:newId, name:rec.originalName, link:link});
  Bot.setProperty('userFiles_'+user.id, userList, 'json');

  // ---- 7️⃣ Ack to user ----
  Bot.sendMessage('✅ File stored successfully!\nLink: '+link);
}
catch(e){
  Bot.sendMessage('❌ Upload to storage channel failed.');
  // status remains failed
}
