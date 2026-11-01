/*CMD
  command: /fcStepId
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
var id = message.trim();
if (id === "❌ Cancel" || id === "/cancel") {
  Bot.runCommand("/adminForceChannel");
  return;
}

Bot.setProperty("temp_fc_id_" + user.telegramid, id, "string");

var msg = "➕ *Add New Force Channel (Step 3/5)*\n`———————————————————————`\n\n" +
  "Channel ID: `" + id + "`\n\n" +
  "👉 *Select the Channel Type:*";

var keyb = [
  [
    { text: "📢 Public Channel", callback_data: "/fcStepType public" },
    { text: "🔒 Private Channel", callback_data: "/fcStepType private" }
  ],
  [
    { text: "📩 Private Request Channel", callback_data: "/fcStepType request" }
  ],
  [
    { text: "⬅️ Cancel", callback_data: "/adminForceChannel" }
  ]
];

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
