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

var adminId = Bot.getProperty("admin_id");
if (!adminId) {
  Bot.setProperty("admin_id", user.telegramid);
  Bot.setProperty("admin_" + user.telegramid, true);
  adminId = user.telegramid;
}

var isAdmin = (user.telegramid == adminId) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;

if (!isAdmin) {
  var keyb = [
    [{ text: "👑 Claim Admin Access", callback_data: "/claimadmin" }]
  ];
  Api.sendMessage({
    text: "🚫 *Access Denied: Admins Only.*\n\nYour Telegram ID: `" + user.telegramid + "`\n\nIf you are the bot owner, click below to claim admin access:",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
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
