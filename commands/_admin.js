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

var botUsername = (Bot.getProperty("bot_username") || bot.name || "FileStoreToxicBot").replace("@", "");

// Primary Keyboard with style: "primary"
var adminPrimaryKeyboard = [
  [
    { text: "📊 Statistics Dashboard", style: "primary" },
    { text: "🔧 Force Channels", style: "primary" }
  ],
  [
    { text: "🏷️ Storage Channel", style: "primary" },
    { text: "👋 Welcome Message", style: "primary" }
  ],
  [
    { text: "📣 Broadcast", style: "primary" },
    { text: "💾 CSV Export", style: "primary" }
  ],
  [
    { text: "🆘 Support Management", style: "primary" },
    { text: "🤖 Refresh Bot Info", style: "primary" }
  ],
  [
    { text: "⬅️ Back to Main Menu", style: "primary" }
  ]
];

var bbAdminKeyboard = "📊 Statistics Dashboard,🔧 Force Channels\n🏷️ Storage Channel,👋 Welcome Message\n📣 Broadcast,💾 CSV Export\n🆘 Support Management,🤖 Refresh Bot Info\n⬅️ Back to Main Menu";

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
    { text: "🆘 Support Management", callback_data: "/adminSupport" },
    { text: "🤖 Refresh Bot Info", callback_data: "/refreshBotInfo" }
  ]
];

var msg = "🛠 *Super Admin Control Panel*\n`———————————————————————`\n" +
  "• *Admin:* `" + user.telegramid + "`\n" +
  "• *Bot Username:* @" + botUsername + "\n\n" +
  "Select a management section below (using the buttons below or inline):";

Bot.sendKeyboard(bbAdminKeyboard, "🛠 Admin Panel loaded:");

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
    reply_markup: { keyboard: adminPrimaryKeyboard, resize_keyboard: true }
  });
  Api.sendMessage({
    text: "👇 Quick Actions:",
    reply_markup: { inline_keyboard: keyb }
  });
}
