/*CMD
  command: /supportUser
  description: Show current support contact (user view)
  need_reply: false
*/
var sup = Bot.getProperty('supportContact', {username:'',link:''});
if (!sup.username && !sup.link){
  Bot.sendMessage('🛠️ No support contact configured yet.');
}else{
  var txt='📞 *Support Contact*\n';
  if (sup.username) txt+='@'+sup.username+'\n';
  if (sup.link) txt+=sup.link+'\n';
  Bot.sendMessage(txt,{parse_mode:'Markdown'});
}
