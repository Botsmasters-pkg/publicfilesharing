/*CMD
  command: /fcSaveChannel
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

var hasForward = request && request.message && request.message.forward_from_chat;

// Extract actual user input cleanly
var text = "";
if (params && params.trim() !== "") {
  text = params.trim();
} else if (request && request.message && request.message.text) {
  text = request.message.text.trim();
} else {
  text = Bot.getProperty("temp_last_text_" + user.telegramid, "");
}

// Strip command invocation if leaked
text = text.replace(/^\/fcSaveChannel\s*/i, "").trim();

if (!text && !hasForward) return;

if (text === "/cancel" || text === "❌ Cancel" || text.toLowerCase() === "cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
  Bot.sendMessage("❌ Channel addition cancelled.");
  Bot.runCommand("/adminForceChannel");
  return;
}

var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "public");
var forceChannels = Bot.getProperty("forceChannels", []);

var id = "";
var link = Bot.getProperty("temp_fc_link_" + user.telegramid, "");
var name = "";

if (hasForward) {
  var fwChat = request.message.forward_from_chat;
  id = fwChat.id.toString();
  name = fwChat.title || ("Channel " + (forceChannels.length + 1));
  if (fwChat.username) {
    id = "@" + fwChat.username;
    link = "https://t.me/" + fwChat.username;
  }
} else if (text) {
  var parts = text.split(/\s+/);

  if (type === "public") {
    if (text.indexOf("http") === 0) {
      link = text;
      var cleanUser = text.replace(/https?:\/\/t\.me\//i, "").replace("/", "").trim();
      id = "@" + cleanUser;
      name = "@" + cleanUser;
    } else {
      id = "@" + text.replace("@", "");
      name = id;
      link = "https://t.me/" + text.replace("@", "");
    }
  } else {
    // Private or Request channel
    if (parts.length >= 2) {
      // User passed both ID and Link on a single line
      var p0 = parts[0];
      var p1 = parts[1];
      if (p0.indexOf("http") === 0) {
        link = p0;
        id = p1;
      } else {
        id = p0;
        link = p1;
      }
      name = id;
    } else {
      // Single token sent: could be Chat ID or Invite Link
      if (text.indexOf("http") === 0 || text.indexOf("t.me") === 0) {
        link = text.indexOf("http") === 0 ? text : ("https://" + text);
        id = "";
      } else {
        id = text;
        name = text;
      }
    }
  }
}

// Ensure id and name are never command strings
if (id && id.indexOf("/fc") === 0) {
  id = "";
}
if (name && name.indexOf("/fc") === 0) {
  name = "";
}

// Case 1: ID detected, but Link is needed for private/request
if (id && !link && (type === "private" || type === "request")) {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_link", "string");
  Bot.setProperty("temp_fc_id_" + user.telegramid, id, "string");
  Bot.setProperty("temp_fc_name_" + user.telegramid, name || id, "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

  var askLinkMsg = "✅ *Channel ID Detected:* `" + id + "`" + (name ? ("\n• Title: *" + name + "*") : "") + "\n`———————————————————————`\n\n" +
    "👉 *Now send the " + (type === "request" ? "Join Request" : "Private") + " Invite Link:*\n" +
    "_(Example: `https://t.me/+AbCdEfGhIjK`)_";

  var cancelPrimaryKeyboard = [
    [{ text: "❌ Cancel", style: "primary" }]
  ];

  Api.sendMessage({
    text: askLinkMsg,
    parse_mode: "Markdown",
    reply_markup: { keyboard: cancelPrimaryKeyboard, resize_keyboard: true }
  });
  return;
}

// Case 2: Link provided first, but numeric Chat ID is missing
if (!id && link && (type === "private" || type === "request")) {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_id", "string");
  Bot.setProperty("temp_fc_link_" + user.telegramid, link, "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

  var askIdMsg = "✅ *Invite Link Detected:* " + link + "\n`———————————————————————`\n\n" +
    "👉 *Now send the Numeric Chat ID of this channel:*\n" +
    "_(Example: `-1001234567890`)_\n" +
    "_Tip: You can forward any post from that channel to get its ID._";

  var cancelPrimaryKeyboard2 = [
    [{ text: "❌ Cancel", style: "primary" }]
  ];

  Api.sendMessage({
    text: askIdMsg,
    parse_mode: "Markdown",
    reply_markup: { keyboard: cancelPrimaryKeyboard2, resize_keyboard: true }
  });
  return;
}

if (!id) {
  Bot.sendMessage("⚠️ Could not detect channel. Please send username (e.g. `@MyChannel`) or channel link.");
  return;
}

// Clear admin waiting states
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");

var finalLink = link || ("https://t.me/" + id.replace("@", ""));

// Complete the addition
var newChannel = {
  id: id,
  name: name || id,
  type: type,
  link: finalLink,
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
  "• *Channel Link:* " + finalLink + "\n" +
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
