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
var uHandle = user.username || "";

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
  if (!ch.expired) {
    if (ch.expiryTime > 0 && now >= ch.expiryTime) {
      ch.expired = true; // Auto-expired!
    } else {
      activeChannels.push(ch);
    }
  }
}
Bot.setProperty("forceChannels", forceChannels, "json");

var legacyForce = Bot.getProperty("forceChannel");
if (legacyForce && activeChannels.length === 0) {
  activeChannels.push({ id: legacyForce });
}

// Enforce Channel subscription for normal users
if (activeChannels.length > 0 && !isAdmin) {
  var p = params ? params.trim() : "none";
  Api.getChatMember({
    chat_id: activeChannels[0].id,
    user_id: user.telegramid,
    on_result: "/onCheckJoin " + p,
    on_error: (p !== "none" ? "/downloadDirect " + p : "/showMenu")
  });
  return;
}

// Proceed to Main Menu / Welcome Message or Download
Bot.runCommand("/showMenu" + (params ? (" " + params) : ""));
