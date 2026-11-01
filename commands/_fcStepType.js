/*CMD
  command: /fcStepType
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

if (!params) return;
var type = params.trim().toLowerCase();
Bot.setProperty("temp_fc_type_" + user.telegramid, type, "string");

var msg = "";
if (type === "public") {
  msg = "📢 *Add Public Channel*\n`———————————————————————`\n\n" +
    "👉 *Send the Channel Username, Link OR Forward a message from the channel:*\n" +
    "• Username: `@MyChannel`\n" +
    "• Public Link: `https://t.me/MyChannel`\n" +
    "• Or simply forward any post from that channel here!\n\n" +
    "*(Make sure the bot is added as Administrator in the channel)*";
} else if (type === "request") {
  msg = "📩 *Add Private Join Request Channel*\n`———————————————————————`\n\n" +
    "👉 *Send Channel ID & Join Request Link OR Forward a message:*\n" +
    "• Single line: `-1001234567890 https://t.me/+AbCdEfGhIjK`\n" +
    "• Or send just Chat ID / forward a message, bot will ask for invite link next.\n\n" +
    "*(Make sure the bot is added as Administrator with invite permissions)*";
} else {
  msg = "🔒 *Add Private Channel*\n`———————————————————————`\n\n" +
    "👉 *Send Channel ID & Private Invite Link OR Forward a message:*\n" +
    "• Single line: `-1001234567890 https://t.me/+AbCdEfGhIjK`\n" +
    "• Or send just Chat ID / forward a message, bot will ask for invite link next.\n\n" +
    "*(Make sure the bot is added as Administrator in the channel)*";
}

var keyb = [
  [{ text: "⬅️ Cancel", callback_data: "/adminForceChannel" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: msg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}

Bot.run({ command: "/fcSaveChannel" });
