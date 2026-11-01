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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;

if (!isAdmin) {
  Api.sendMessage({
    text: "🚫 *Access Denied: Admins Only.*",
    parse_mode: "Markdown"
  });
  return;
}

var keyb = [
  [
    { text: "📊 Bot Statistics", callback_data: "/adminStats" },
    { text: "🏷️ Storage Channel", callback_data: "/adminStorage" }
  ],
  [
    { text: "🔧 Force Sub Channel", callback_data: "/adminForceChannel" },
    { text: "👋 Welcome Message", callback_data: "/adminWelcome" }
  ],
  [
    { text: "📣 Broadcast", callback_data: "/adminBroadcast" },
    { text: "💾 CSV Export", callback_data: "/adminExport" }
  ]
];

var msg = "🛠 *Admin Control Panel*\n`———————————————————————`\nWelcome, Admin! (ID: `" + user.telegramid + "`)\nSelect an option below to manage the bot:";

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
