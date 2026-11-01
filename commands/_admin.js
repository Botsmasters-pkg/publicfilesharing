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

var isAdmin = (user.telegramid == 1793554159) || Bot.getProperty("admin_" + user.telegramid) || user.is_admin;
if (!isAdmin) {
  Bot.sendMessage("🚫 *Access Denied: Admins Only.*", { parse_mode: "Markdown" });
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

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: "🛠 *Admin Control Panel*\n`———————————————————————`\nWelcome, Admin! Select an option below to manage the bot:",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: "🛠 *Admin Control Panel*\n`———————————————————————`\nWelcome, Admin! Select an option below to manage the bot:",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}

