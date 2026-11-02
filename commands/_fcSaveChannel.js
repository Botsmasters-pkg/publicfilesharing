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

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

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
  Bot.setProperty("temp_fc_name_" + user.telegramid, "", "string");
  Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
  Bot.setProperty("temp_fc_type_" + user.telegramid, "", "string");
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
    if (text.indexOf("http") === 0 || text.indexOf("t.me/") !== -1) {
      link = text.indexOf("http") === 0 ? text : ("https://" + text);
      var cleanUser = text.replace(/https?:\/\/t\.me\//i, "").replace("@", "").replace(/\/.*/, "").trim();
      id = "@" + cleanUser;
      name = id;
    } else {
      var clean = text.replace("@", "").trim();
      id = "@" + clean;
      name = id;
      link = "https://t.me/" + clean;
    }
  } else {
    // Private or Join Request channel:
    // Check if user provided BOTH Chat ID and Invite Link on the same line:
    var tokens = text.split(/\s+/);
    var foundId = "";
    var foundLink = "";

    for (var tIdx = 0; tIdx < tokens.length; tIdx++) {
      var tok = tokens[tIdx].trim();
      if (!tok) continue;
      if (tok.indexOf("http://") === 0 || tok.indexOf("https://") === 0 || tok.indexOf("t.me/") === 0 || tok.indexOf("telegram.me/") === 0) {
        foundLink = tok.indexOf("http") === 0 ? tok : ("https://" + tok);
      } else if (tok.match(/^-?100\d+$/) || tok.match(/^-\d+$/) || tok.match(/^\d{8,}$/)) {
        foundId = tok;
      }
    }

    if (foundId && foundLink) {
      id = foundId;
      link = foundLink;
      name = id;
    } else if (foundLink && !foundId) {
      // User sent ONLY a link in Step 1!
      // Remember the link and prompt for the Chat ID!
      Bot.setProperty("temp_fc_link_" + user.telegramid, foundLink, "string");
      Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_chatid", "string");

      var promptChatIdMsg = "✅ <b>Invite Link Detected:</b> <code>" + escapeHtml(foundLink) + "</code>\n" +
        "<code>———————————————————————</code>\n\n" +
        "👉 <b>Now send the Numeric Chat ID of this Channel:</b>\n" +
        "• Example: <code>-1004307092136</code>\n" +
        "• Or simply forward any post from the channel to auto-detect ID!\n\n" +
        "<i>(Telegram requires the numeric Chat ID so the bot can verify members)</i>";

      Api.sendMessage({
        text: promptChatIdMsg,
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [[{ text: "❌ Cancel", style: "primary" }]],
          resize_keyboard: true
        }
      });
      return;
    } else {
      // User sent Chat ID (or already has link stored from previous step)
      var preLink = Bot.getProperty("temp_fc_link_" + user.telegramid, "");
      var potentialId = text.trim();

      if (potentialId.match(/^-?100\d+$/) || potentialId.match(/^-\d+$/) || potentialId.match(/^\d{8,}$/)) {
        id = potentialId;
        if (!id.startsWith("-")) {
          id = "-100" + id.replace(/^100/, "");
        }
        name = id;
        link = preLink;
      } else {
        id = "";
      }
    }
  }
}

// Ensure id and name are never command strings
if (id && id.indexOf("/fc") === 0) id = "";
if (name && name.indexOf("/fc") === 0) name = "";

if (!id) {
  var errorMsg = "⚠️ <b>Invalid Chat ID!</b>\n\n" +
    "Please send a valid numeric Chat ID (starting with <code>-100...</code>, e.g. <code>-1004307092136</code>) or forward any post from that channel.\n\n" +
    "<i>Or tap ❌ Cancel below to stop.</i>";
  Api.sendMessage({
    text: errorMsg,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [[{ text: "❌ Cancel", style: "primary" }]],
      resize_keyboard: true
    }
  });
  return;
}

// For Private or Request Channel: if we don't have the link yet, ask for it in Step 2!
if (type === "private" || type === "request") {
  if (!link) {
    Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_link", "string");
    Bot.setProperty("temp_fc_id_" + user.telegramid, id, "string");
    Bot.setProperty("temp_fc_name_" + user.telegramid, name || id, "string");
    Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

    var askLinkMsg = "✅ <b>Channel ID Detected:</b> <code>" + escapeHtml(id) + "</code>" + (name && name !== id ? ("\n• <b>Title:</b> " + escapeHtml(name)) : "") + "\n" +
      "<code>———————————————————————</code>\n\n" +
      "👉 <b>Now send the " + (type === "request" ? "Join Request" : "Private") + " Invite Link (Step 2/2):</b>\n" +
      "• Example: <code>https://t.me/+AbCdEfGhIjK</code>\n\n" +
      "<i>(Make sure Join Request is turned ON in the link if this is a Request channel)</i>";

    var cancelPrimaryKeyboard = [
      [{ text: "❌ Cancel", style: "primary" }]
    ];

    Api.sendMessage({
      text: askLinkMsg,
      parse_mode: "HTML",
      reply_markup: { keyboard: cancelPrimaryKeyboard, resize_keyboard: true }
    });
    return;
  }
}

// Complete the addition (for Public channel, or when both ID & Link are present)
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_name_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_type_" + user.telegramid, "", "string");

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

var successMsg = "✅ <b>Force Channel Added Successfully!</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Channel Target:</b> <code>" + escapeHtml(id) + "</code>\n" +
  "• <b>Channel Type:</b> <code>" + type.toUpperCase() + "</code>\n" +
  "• <b>Channel Link:</b> " + escapeHtml(finalLink) + "\n" +
  "• <b>Status:</b> 🟢 <b>ENABLED &amp; Active</b>\n\n" +
  "<i>ℹ️ Note: Auto-expiry timer is OFF by default. You can set a timer anytime from Admin Panel.</i>";

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
  parse_mode: "HTML",
  reply_markup: { keyboard: successKeyboard, resize_keyboard: true }
});
