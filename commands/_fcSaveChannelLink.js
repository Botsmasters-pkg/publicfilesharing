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
  Bot.sendMessage("❌ Channel addition cancelled.");
  Bot.runCommand("/adminForceChannel");
  return;
}

var id = Bot.getProperty("temp_fc_id_" + user.telegramid);
var name = Bot.getProperty("temp_fc_name_" + user.telegramid, id);
var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "private");
var forceChannels = Bot.getProperty("forceChannels", []);

var link = text;
if (link.indexOf("http") !== 0) {
  link = "https://" + link.replace(/^\/+/, "");
}

// Clear admin waiting states and temps
Bot.setProperty("admin_state_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_name_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_type_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

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

forceChannels.push(newChannel);
Bot.setProperty("forceChannels", forceChannels, "json");

var successMsg = "✅ *Force Channel Added Successfully!*\n`———————————————————————`\n\n" +
  "• *Channel Target:* `" + id + "`\n" +
  "• *Channel Type:* `" + type.toUpperCase() + "`\n" +
  "• *Channel Link:* " + link + "\n" +
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
