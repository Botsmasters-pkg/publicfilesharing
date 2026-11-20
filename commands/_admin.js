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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

if (!isAdmin) {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: "🚫 <b>Access Denied: Admins Only.</b>",
    parse_mode: "HTML"
  });
  return;
}

// Clear any dangling admin text state
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var botUsername = (Bot.getProperty("bot_username") || (bot && bot.name) || "bot").replace("@", "");

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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

var msg = "🛠 <b>Super Admin Control Panel</b>\n" +
  "<code>———————————————————————</code>\n" +
  "• <b>Admin:</b> <code>" + escapeHtml(user.telegramid) + "</code>\n" +
  "• <b>Bot Username:</b> @" + escapeHtml(botUsername) + "\n\n" +
  "Select a management section below using the keyboard buttons:";

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
    parse_mode: "HTML",
    reply_markup: { keyboard: adminPrimaryKeyboard, resize_keyboard: true }
  });
}
