/*CMD
  command: /adminpanel
  description: Show admin dashboard (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin){
  Bot.sendMessage('🚫 You are not authorized.');
  return;
}
Bot.sendMessage('🛠️ *Admin Panel*', {
  parse_mode:'Markdown',
  reply_markup:{
    inline_keyboard:[
      [{text:'📊 Statistics',      callback_data:'/adminStats'}],
      [{text:'🏷️ Storage Channel',callback_data:'/adminStorage'}],
      [{text:'📣 Broadcast',       callback_data:'/adminBroadcast'}],
      [{text:'💾 CSV Export',      callback_data:'/adminExport'}],
      [{text:'👋 Welcome Message',callback_data:'/adminWelcome'}],
      [{text:'🔧 Force Channels',  callback_data:'/adminForceChannel'}],
      [{text:'🆘 Support Contact',callback_data:'/adminSupport'}]
    ]
  }
});
