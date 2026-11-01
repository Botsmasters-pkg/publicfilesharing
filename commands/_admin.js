/*CMD
  command: /admin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: /adminpanel
  group: 
CMD*/

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

if (!isAdmin) {
  Api.sendMessage({
    text: "🚫 *Access Denied: Admins Only.*",
    parse_mode: "Markdown"
  });
  return;
}

var keyb = [
  [
    { text: "📊 Statistics Dashboard", callback_data: "/adminStats" },
    { text: "🔧 Force Channels", callback_data: "/adminForceChannel" }
  ],
  [
    { text: "🏷️ Storage Channel", callback_data: "/adminStorage" },
    { text: "👋 Welcome Message", callback_data: "/adminWelcome" }
  ],
  [
    { text: "📣 Broadcast", callback_data: "/adminBroadcast" },
    { text: "💾 CSV Export", callback_data: "/adminExport" }
  ],
  [
    { text: "🆘 Support Management", callback_data: "/adminSupport" }
  ]
];

var msg = "🛠 *Super Admin Control Panel*\n`———————————————————————`\n" +
  "Welcome, Admin! (ID: `" + user.telegramid + "`)\n\n" +
  "Select a management section below:";

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
