/*CMD
  command: /adminWelcome
  description: Show and edit the welcome message (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin) return;
var wm = Bot.getProperty('welcomeMessage', {
  type:'text',
  text:'👋 Welcome to File Store Bot!',
  media:'',
  caption:''
});
var txt='*📢 Welcome Message Settings*\n\n';
txt+=`Current Type: \`${wm.type}\`\n`;
if (wm.type==='text') txt+=`Text: \`${wm.text}\`\n`;
else txt+=`Caption: \`${wm.caption}\`\n`;
txt+='\nCommands to change it:\n';
txt+='`/setWelcomeText <text>`\n';
txt+='`/setWelcomePhoto <file_id> <optional caption>`\n';
txt+='`/setWelcomeVideo <file_id> <optional caption>`\n';
txt+='`/clearWelcome` – reset to default text.\n';
Bot.sendMessage(txt,{parse_mode:'Markdown'});
