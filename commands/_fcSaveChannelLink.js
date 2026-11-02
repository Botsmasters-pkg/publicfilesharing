/*CMD
  command: /fcSaveChannelLink
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
text = text.replace(/^\/fcSaveChannelLink\s*/i, "").trim();

if (!text) return;

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

if (text.indexOf("/fc") === 0 || text.indexOf("/") === 0) {
  Api.sendMessage({
    text: "⚠️ <b>Invalid link!</b>\n\nPlease send the invite link starting with <code>https://t.me/</code> (or tap ❌ Cancel).",
    parse_mode: "HTML",
    reply_markup: { keyboard: [[{ text: "❌ Cancel", style: "primary" }]], resize_keyboard: true }
  });
  return;
}

var id = Bot.getProperty("temp_fc_id_" + user.telegramid);
var name = Bot.getProperty("temp_fc_name_" + user.telegramid, id);
var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "private");
var forceChannels = Bot.getProperty("forceChannels", []);

if (!id || id.indexOf("/fc") === 0) {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.sendMessage("⚠️ Channel ID was missing. Please add the channel again.");
  Bot.runCommand("/adminForceChannel");
  return;
}

// Validate that input is actually an invite link (not a chat ID resend or invalid text)
var isLink = (text.indexOf("t.me/") !== -1 || text.indexOf("telegram.me/") !== -1 || text.indexOf("http://") === 0 || text.indexOf("https://") === 0);
if (!isLink || text.match(/^-?100\d+$/) || text.match(/^-\d+$/)) {
  Api.sendMessage({
    text: "⚠️ <b>Invalid Invite Link!</b>\n\nYou sent: <code>" + escapeHtml(text) + "</code>\n\nChannel ID <code>" + escapeHtml(id) + "</code> is already saved.\n\n👉 Please send the Telegram <b>Invite Link</b> (e.g. <code>https://t.me/+AbCdEfGhIjK</code> or <code>https://t.me/joinchat/...</code>).\n\n<i>Or tap ❌ Cancel below to stop.</i>",
    parse_mode: "HTML",
    reply_markup: { keyboard: [[{ text: "❌ Cancel", style: "primary" }]], resize_keyboard: true }
  });
  return;
}

var link = text.trim();
if (link.indexOf("http") !== 0) {
  link = "https://" + link.replace(/^\/+/, "");
}

// Clear admin waiting states and temps
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_name_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_type_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

// Clean existing corrupted channels
var cleaned = [];
for (var k = 0; k < forceChannels.length; k++) {
  var item = forceChannels[k];
  if (item && item.id && item.id.indexOf("/fc") === -1 && (!item.link || item.link.indexOf("/fc") === -1)) {
    cleaned.push(item);
  }
}

var newChannel = {
  id: id,
  name: name || id,
  type: type,
  link: link,
  addedAt: Date.now(),
  expiryTime: 0,
  configuredMinutes: 0,
  expired: false,
  enabled: true
};

cleaned.push(newChannel);
Bot.setProperty("forceChannels", cleaned, "json");

// Use HTML with escapeHtml to prevent errors with underscores in URLs (e.g. +eC3I_WcwKBgwYjVl)
var successMsg = "✅ <b>Force Channel Added Successfully!</b>\n" +
  "<code>———————————————————————</code>\n\n" +
  "• <b>Channel Target:</b> <code>" + escapeHtml(id) + "</code>\n" +
  "• <b>Channel Type:</b> <code>" + type.toUpperCase() + "</code>\n" +
  "• <b>Channel Link:</b> " + escapeHtml(link) + "\n" +
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
