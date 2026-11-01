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

if (!message) return;
var text = message.trim();

if (text === "/cancel" || text === "❌ Cancel" || text.toLowerCase() === "cancel") {
  Bot.sendMessage("❌ Channel addition cancelled.");
  Bot.runCommand("/adminForceChannel");
  return;
}

var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "public");
var forceChannels = Bot.getProperty("forceChannels", []);

var id = "";
var link = "";
var name = "";

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
  var parts = text.split(/\s+/);
  if (parts.length >= 2) {
    id = parts[0];
    link = parts[1];
  } else {
    id = parts[0];
    if (id.indexOf("http") === 0) {
      link = id;
      id = "Private Channel " + (forceChannels.length + 1);
    } else {
      link = id.indexOf("@") === 0 ? ("https://t.me/" + id.replace("@", "")) : "";
    }
  }
  name = (id.indexOf("@") === 0 ? id : (type === "request" ? "Private Request Channel " : "Private Channel ") + (forceChannels.length + 1));
}

var newChannel = {
  id: id,
  name: name,
  type: type,
  link: link || ("https://t.me/" + id.replace("@", "")),
  addedAt: Date.now(),
  expiryTime: 0,
  configuredMinutes: 0,
  expired: false
};

forceChannels.push(newChannel);
Bot.setProperty("forceChannels", forceChannels, "json");

var successMsg = "✅ *Force Channel Added Successfully!*\n`———————————————————————`\n\n" +
  "• *Channel Target:* `" + id + "`\n" +
  "• *Channel Type:* `" + type.toUpperCase() + "`\n" +
  "• *Channel Link:* " + (link || "Auto-detected") + "\n" +
  "• *Status:* 🟢 *Active (Permanent)*\n\n" +
  "_ℹ️ Note: Auto-expiry timer is OFF by default. If you want this channel to expire automatically, click '⏱️ Set Expiry Timer' below._";

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
