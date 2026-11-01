/*CMD
  command: /fcStepName
  help: 
  need_reply: false
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
var name = message.trim();
if (name === "❌ Cancel" || name === "/cancel") {
  Bot.runCommand("/adminForceChannel");
  return;
}

Bot.setProperty("temp_fc_name_" + user.telegramid, name, "string");

var msg = "➕ *Add New Force Channel (Step 2/5)*\n`———————————————————————`\n\n" +
  "Channel Name: *" + name + "*\n\n" +
  "👉 *Now send the Telegram Channel ID:*\n" +
  "_(Example: `-1001234567890` or `@channel_username`)_\n" +
  "*(Make sure the bot is an Administrator in that channel!)*";

var keyb = [
  [{ text: "⬅️ Cancel", callback_data: "/adminForceChannel" }]
];

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});

Bot.run({ command: "/fcStepId" });

