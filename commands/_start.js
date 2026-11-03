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

// Auto-detect Bot's own Telegram username dynamically from Telegram API
var currentBotId = (bot && bot.id) ? bot.id : 0;
var savedBotId = Bot.getProperty("bb_bot_id");
var currentCachedUser = Bot.getProperty("bot_username");

// If cloned bot instance or parent username is stuck in a clone:
if (currentBotId && (currentBotId != 1793554159 || savedBotId !== currentBotId)) {
  if (currentCachedUser === "toxicfighterobot" || savedBotId !== currentBotId) {
    Bot.setProperty("bb_bot_id", currentBotId, "integer");
    Bot.setProperty("bot_username", null);
    Bot.setProperty("bot_id", null);
    Bot.setProperty("bot_first_name", null);
  }
}

// Always query Telegram API using this bot instance's own token
Api.getMe({
  on_result: "/onGetBotUsername"
});

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

// Check if user has already verified/joined all active force channels
var allJoined = true;
var unverifiedChannels = [];

for (var k = 0; k < activeChannels.length; k++) {
  var ach = activeChannels[k];
  var isJoined = Bot.getProperty("user_joined_" + ach.id + "_" + user.telegramid) ||
                 Bot.getProperty("join_req_" + ach.id + "_" + user.telegramid);
  if (!isJoined) {
    allJoined = false;
    unverifiedChannels.push(ach);
  }
}

// Enforce Channel subscription ONLY if not all channels are joined and not admin
if (activeChannels.length > 0 && !allJoined && !isAdmin) {
  var checkParam = (params && params.trim() !== "") ? params.trim() : "none";

  // Build strictly 2x2 Grid with buttons named "JOIN" for unverified channels
  var grid = [];
  var currentRow = [];

  for (var j = 0; j < unverifiedChannels.length; j++) {
    var link = unverifiedChannels[j].link || ("https://t.me/" + unverifiedChannels[j].id.replace("@", ""));
    if (link.indexOf("http") !== 0) {
      link = "https://t.me/" + link.replace("@", "");
    }
    currentRow.push({
      text: "JOIN",
      url: link,
      style: "primary"
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
    { text: "🔄 Check Membership", callback_data: "/checkJoin " + checkParam, style: "primary" }
  ]);

  var alertMsg = "📢 <b>Join Required Channel" + (unverifiedChannels.length > 1 ? "s" : "") + "</b>\n<code>———————————————————————</code>\n\n" +
    "You must join our mandatory channel" + (unverifiedChannels.length > 1 ? "s" : "") + " before you can access this bot.\n\n" +
    "👉 Click <b>JOIN</b> below, join the channel(s), and then click <b>Check Membership</b>:";

  Api.sendMessage({
    text: alertMsg,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: grid }
  });
  return;
}

// User is verified or admin! If file parameter present, download directly with NO interruption!
if (params && params.trim() !== "" && params.trim() !== "none") {
  Bot.runCommand("/downloadDirect " + params.trim());
} else {
  Bot.runCommand("/showMenu");
}
