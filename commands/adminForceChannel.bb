/*CMD
  command: /adminForceChannel
  description: Main menu for Force‑Channel management (admin‑only)
  need_reply: false
*/
if (!user || !user.is_admin) return;
Bot.sendMessage('🔧 *Force Channel Management*', {
  parse_mode:'Markdown',
  reply_markup:{
    inline_keyboard:[
      [{text:'➕ Add Channel',   callback_data:'/fcAdd'}],
      [{text:'📄 List Channels',callback_data:'/fcList'}],
      [{text:'⬅️ Back',          callback_data:'/adminPanel'}]
    ]
  }
});
