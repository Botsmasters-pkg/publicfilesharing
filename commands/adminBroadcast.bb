/*CMD
  command: /adminBroadcast
  description: Initiate a broadcast to all users (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin) return;
Bot.sendMessage('📢 Send the broadcast content (text / photo / video).');
Bot.setProperty('awaitingBroadcast_'+user.id,true,'boolean');
