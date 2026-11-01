/*CMD
  command: /adminStorage
  description: View / change storage channel ID (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin) return;
var cfg = Bot.getProperty('storageChannelConfig', {
  defaultChannelId:'-1004304151228',
  currentChannelId:'-1004304151228'
});
var txt = '*🏷️ Storage Channel Settings*\n\n';
txt+=`Current ID: \`${cfg.currentChannelId}\`\n`;
txt+=`Default ID: \`${cfg.defaultChannelId}\`\n\n`;
txt+='Send the **new** channel ID as a plain message (e.g. `-1001234567890`).';
Bot.sendMessage(txt,{parse_mode:'Markdown'});
Bot.setProperty('awaitingStorageId_'+user.id,true,'boolean');
