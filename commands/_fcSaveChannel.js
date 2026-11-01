/*CMD
  command: /fcSaveChannel
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (message) {
  var t = message.trim();
  if (t === "/cancel" || t === "❌ Cancel" || t.toLowerCase() === "cancel") {
    Bot.sendMessage("❌ Channel addition cancelled.");
    Bot.runCommand("/adminForceChannel");
    return;
  }
}

var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "public");
var forceChannels = Bot.getProperty("forceChannels", []);

var id = "";
var link = "";
var name = "";

// Check if message was forwarded from a channel
if (request.message && request.message.forward_from_chat) {
  var fwChat = request.message.forward_from_chat;
  id = fwChat.id.toString();
  name = fwChat.title || ("Channel " + (forceChannels.length + 1));
  if (fwChat.username) {
    id = "@" + fwChat.username;
    link = "https://t.me/" + fwChat.username;
  }
} else if (message) {
  var text = message.trim();
  var parts = text.split(/\s+/);

  if (type === "public") {
    if (text.indexOf("http") === 0) {
      link = text;
      var cleanUser = text.replace(/https?:\/\/t\.me\//i, "").replace("/", "").trim();
      id = "@" + cleanUser;
      name = "@" + cleanUser;
    } else if (text.indexOf("@") === 0) {
      id = text;
      name = text;
      link = "https://t.me/" + text.replace("@", "");
    } else {
      id = "@" + text.replace("@", "");
      name = id;
      link = "https://t.me/" + text.replace("@", "");
    }
  } else {
    // Private or Request channel
    if (parts.length >= 2) {
      id = parts[0];
      link = parts[1];
      name = id;
    } else {
      id = parts[0];
      if (id.indexOf("http") === 0) {
        link = id;
        id = "Channel_" + (forceChannels.length + 1);
        name = "Channel " + (forceChannels.length + 1);
      } else {
        name = id;
      }
    }
  }
}

// If link is still empty and channel is private or request, ask for invite link!
if (!link && (type === "private" || type === "request")) {
  Bot.setProperty("temp_fc_id_" + user.telegramid, id, "string");
  Bot.setProperty("temp_fc_name_" + user.telegramid, name || id, "string");

  var askLinkMsg = "✅ *Channel ID Detected:* `" + id + "`" + (name ? ("\n• Title: *" + name + "*") : "") + "\n`———————————————————————`\n\n" +
    "👉 *Now send the " + (type === "request" ? "Join Request" : "Private") + " Invite Link:*\n" +
    "_(Example: `https://t.me/+AbCdEfGhIjK`)_";

  var cancelKey = [
    [{ text: "⬅️ Cancel", callback_data: "/adminForceChannel" }]
  ];

  Api.sendMessage({
    text: askLinkMsg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: cancelKey }
  });

  Bot.run({ command: "/fcSaveChannelLink" });
  return;
}

// Complete the addition
var newChannel = {
  id: id,
  name: name || id,
  type: type,
  link: link || ("https://t.me/" + id.replace("@", "")),
  addedAt: Date.now(),
  expiryTime: 0,
  configuredMinutes: 0,
  expired: false,
  enabled: true
};

forceChannels.push(newChannel);
Bot.setProperty("forceChannels", forceChannels, "json");

var successMsg = "✅ *Force Channel Added Successfully!*\n`———————————————————————`\n\n" +
  "• *Channel Target:* `" + id + "`\n" +
  "• *Channel Type:* `" + type.toUpperCase() + "`\n" +
  "• *Channel Link:* " + (link || "Auto-detected") + "\n" +
  "• *Status:* 🟢 *ENABLED & Active*\n\n" +
  "_ℹ️ Note: Auto-expiry timer is OFF by default. You can set a timer anytime from Admin Panel._";

var keyb = [
  [
    { text: "➕ Add Another Channel", callback_data: "/fcAdd" },
    { text: "⏱️ Set Expiry Timer", callback_data: "/fcTimerMenu" }
  ],
  [
    { text: "📄 View Channels", callback_data: "/fcList" },
    { text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }
  ]
];

Api.sendMessage({
  text: successMsg,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
