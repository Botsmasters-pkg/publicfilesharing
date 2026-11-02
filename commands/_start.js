/*CMD
  command: /start
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

// Auto-detect Bot's own Telegram username dynamically from Telegram API if not cached
if (!Bot.getProperty("bot_username")) {
  Api.getMe({
    on_result: "/onGetBotUsername"
  });
}

// Save user to allBotUsers
var allUsers = Bot.getProperty("allBotUsers", []);
if (allUsers.indexOf(user.telegramid) === -1) {
  allUsers.push(user.telegramid);
  Bot.setProperty("allBotUsers", allUsers, "json");
}

// Full Name & Username Auto-Detection
var uFirst = user.first_name || "";
var uLast = user.last_name || "";
var uFull = (uFirst + (uLast ? (" " + uLast) : "")).trim() || "User";
var uHandle = user.username ? ("@" + user.username) : "";

// Save comprehensive user info
Bot.setProperty("userInfo_" + user.telegramid, {
  id: user.telegramid,
  first_name: uFirst,
  last_name: uLast,
  full_name: uFull,
  username: uHandle,
  joined_at: new Date().toISOString()
}, "json");

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;

// Check Force Channels Auto-Expiry and Active list
var forceChannels = Bot.getProperty("forceChannels", []);
var now = Date.now();
var activeChannels = [];

for (var i = 0; i < forceChannels.length; i++) {
  var ch = forceChannels[i];
  if (ch.enabled === false) continue;
  if (!ch.id || ch.id.indexOf("/fc") !== -1 || (ch.link && ch.link.indexOf("/fc") !== -1)) continue;
  if (!ch.expired) {
    if (ch.expiryTime > 0 && now >= ch.expiryTime) {
      ch.expired = true; // Auto-expired!
    } else {
      activeChannels.push(ch);
    }
  }
}
Bot.setProperty("forceChannels", forceChannels, "json");

// Enforce Channel subscription for normal users
if (activeChannels.length > 0 && !isAdmin) {
  var checkParam = (params && params.trim() !== "") ? params.trim() : "none";

  // Build strictly 2x2 Grid with buttons named "JOIN"
  var grid = [];
  var currentRow = [];

  for (var j = 0; j < activeChannels.length; j++) {
    var link = activeChannels[j].link || ("https://t.me/" + activeChannels[j].id.replace("@", ""));
    if (link.indexOf("http") !== 0) {
      link = "https://t.me/" + link.replace("@", "");
    }
    currentRow.push({
      text: "JOIN",
      url: link
    });

    if (currentRow.length === 2) {
      grid.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0) {
    grid.push(currentRow);
  }

  // Add the Check Membership button below the 2x2 grid
  grid.push([
    { text: "🔄 Check Membership", callback_data: "/checkJoin " + checkParam }
  ]);

  var alertMsg = "📢 <b>Join Required Channel" + (activeChannels.length > 1 ? "s" : "") + "</b>\n<code>———————————————————————</code>\n\n" +
    "You must join our mandatory channel" + (activeChannels.length > 1 ? "s" : "") + " before you can access this bot.\n\n" +
    "👉 Click <b>JOIN</b> below, join the channel(s), and then click <b>Check Membership</b>:";

  Api.sendMessage({
    text: alertMsg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: grid }
  });

  Api.sendMessage({
    text: "👇 <b>Or tap the button below to verify membership:</b>",
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [
        [{ text: "🔄 Check Membership", style: "primary" }]
      ],
      resize_keyboard: true
    }
  });
  return;
}

// Proceed to Main Menu / Welcome Message or Download
Bot.runCommand("/showMenu" + (params ? (" " + params) : ""));
