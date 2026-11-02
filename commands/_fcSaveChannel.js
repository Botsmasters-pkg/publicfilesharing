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
  Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
  Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
  Bot.sendMessage("❌ Channel addition cancelled.");
  Bot.runCommand("/adminForceChannel");
  return;
}

var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "public");
var forceChannels = Bot.getProperty("forceChannels", []);

var id = "";
var link = "";
var name = "";

if (hasForward) {
  var fwChat = request.message.forward_from_chat;
  id = fwChat.id.toString();
  name = fwChat.title || id;
  if (type === "public" && fwChat.username) {
    id = "@" + fwChat.username;
    link = "https://t.me/" + fwChat.username;
  }
} else if (text) {
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
    // Private or Join Request channel: STEP 1 IS CHAT ID
    // If user sent both ID and link on same line: "-100123... https://t.me/+..."
    var parts = text.split(/\s+/);
    if (parts.length >= 2) {
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
      id = text.trim();
      name = id;
      link = "";
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

if (!id) {
  Bot.sendMessage("⚠️ Invalid input. Please send a valid Numeric Chat ID (e.g. `-1004307092136`) or forward a post from the channel.");
  return;
}

// For Private or Request Channel: ID received -> ALWAYS ASK FOR INVITE LINK NEXT!
if (type === "private" || type === "request") {
  if (!link) {
    Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_link", "string");
    Bot.setProperty("temp_fc_id_" + user.telegramid, id, "string");
    Bot.setProperty("temp_fc_name_" + user.telegramid, name || id, "string");
    Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

    var askLinkMsg = "✅ *Channel ID Detected:* `" + id + "`" + (name && name !== id ? ("\n• Title: *" + name + "*") : "") + "\n`———————————————————————`\n\n" +
      "👉 *Now send the " + (type === "request" ? "Join Request" : "Private") + " Invite Link (Step 2/2):*\n" +
      "• Example: `https://t.me/+AbCdEfGhIjK`\n\n" +
      "*(Make sure Join Request is turned ON in the link if this is a Request channel)*";

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
}

// Complete the addition (for Public channel or single-line input)
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");

var finalLink = link || ("https://t.me/" + id.replace("@", ""));

// Clean up any corrupt entries first
var cleanedChannels = [];
for (var c = 0; c < forceChannels.length; c++) {
  var fc = forceChannels[c];
  if (fc && fc.id && fc.id.indexOf("/fc") === -1 && (!fc.link || fc.link.indexOf("/fc") === -1)) {
    cleanedChannels.push(fc);
  }
}

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

cleanedChannels.push(newChannel);
Bot.setProperty("forceChannels", cleanedChannels, "json");

var successMsg = "✅ *Force Channel Added Successfully!*\n`———————————————————————`\n\n" +
  "• *Channel Target:* `" + id + "`\n" +
  "• *Channel Type:* `" + type.toUpperCase() + "`\n" +
  "• *Channel Link:* " + finalLink + "\n" +
  "• *Status:* 🟢 *ENABLED & Active*\n\n" +
  "_ℹ️ Note: Auto-expiry timer is OFF by default. You can set a timer anytime from Admin Panel._";

var successKeyboard = [
  [
    { text: "➕ Add Channel", style: "primary" },
    { text: "⏱️ Set Expiry Timer", style: "primary" }
  ],
  [
    { text: "📄 List Channels", style: "primary" },
    { text: "⬅️ Back to Force Channels", style: "primary" }
  ]
];

Api.sendMessage({
  text: successMsg,
  parse_mode: "Markdown",
  reply_markup: { keyboard: successKeyboard, resize_keyboard: true }
});
