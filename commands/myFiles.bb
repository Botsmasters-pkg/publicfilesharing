/*CMD
  command: /myfiles
  description: Show only the caller’s uploaded files with link & traffic button
  need_reply: false
*/
if (!user) return;
var list = Bot.getProperty('userFiles_'+user.id, []);
if (!list.length){
  Bot.sendMessage('🗂️ You have not uploaded any files yet.');
  return;
}
var txt='*Your Files*\n\n';
txt+='| No | Name | Link | Traffic |\n';
txt+='|---|------|------|---------|\n';
for(var i=0;i<list.length;i++){
  var f=list[i];
  var linkMd = f.link ? '['+'Open'+']('+f.link+')' : '—';
  var btn = '`/fileinfo_'+f.fileId+'`';
  txt+=`| ${i+1} | ${f.name} | ${linkMd} | ${btn} |\n`;
}
Bot.sendMessage(txt,{parse_mode:'Markdown',disable_web_page_preview:true});
