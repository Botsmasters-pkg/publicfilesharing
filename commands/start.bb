/*CMD
  command: /start
  description: Show editable welcome message + main menu
  need_reply: false
*/
if (!user) return;

// ---- Welcome Message (admin‑editable) ----
var wm = Bot.getProperty('welcomeMessage', {
  type: 'text',          // text | photo | video
  text: '👋 Welcome to File Store Bot!',
  media: '',             // file_id for photo/video
  caption: ''
});

if (wm.type === 'photo') {
  Bot.sendPhoto({chat_id:user.id, photo:wm.media, caption:wm.caption||wm.text});
}
else if (wm.type === 'video') {
  Bot.sendVideo({chat_id:user.id, video:wm.media, caption:wm.caption||wm.text});
}
else {
  Bot.sendMessage(wm.text||'Welcome!', {disable_web_page_preview:true});
}

// ---- Main menu buttons (user) ----
Bot.sendMessage('Choose an action:', {
  reply_markup:{
    inline_keyboard:[
      [{text:'📂 My Files', callback_data:'/myfiles'}],
      [{text:'📤 Upload File', callback_data:'/uploadDocument'}],
      [{text:'🆘 Support',      callback_data:'/supportUser'}]
    ]
  }
});
