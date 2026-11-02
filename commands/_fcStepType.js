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

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

if (!params) return;
var type = params.trim().toLowerCase();

// Reset all temporary state for clean flow
Bot.setProperty("temp_fc_type_" + user.telegramid, type, "string");
Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_name_" + user.telegramid, "", "string");
Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");

var msg = "";
if (type === "public") {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_public", "string");
  msg = "📢 *Add Public Channel*\n`———————————————————————`\n\n" +
    "👉 *Send the Channel Username or Public Link:*\n" +
    "• Username: `@MyChannel`\n" +
    "• Public Link: `https://t.me/MyChannel`\n" +
    "• Or simply forward any post from that channel here!\n\n" +
    "*(Make sure the bot is added as Administrator in the channel)*";
} else if (type === "request") {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_chatid", "string");
  msg = "📩 *Add Private Join Request Channel (Step 1/2)*\n`———————————————————————`\n\n" +
    "👉 *Send the Numeric Chat ID of this Channel:*\n" +
    "• Example: `-1004307092136`\n" +
    "• Or simply forward any post from that channel here to auto-detect ID!\n\n" +
    "*(After sending Chat ID, the bot will ask for the Join Request Invite Link in Step 2)*";
} else {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_chatid", "string");
  msg = "🔒 *Add Private Channel (Step 1/2)*\n`———————————————————————`\n\n" +
    "👉 *Send the Numeric Chat ID of this Channel:*\n" +
    "• Example: `-1004307092136`\n" +
    "• Or simply forward any post from that channel here to auto-detect ID!\n\n" +
    "*(After sending Chat ID, the bot will ask for the Private Invite Link in Step 2)*";
}

var cancelPrimaryKeyboard = [
  [{ text: "❌ Cancel", style: "primary" }]
];

if (request.data) {
  try {
    Api.deleteMessage({ message_id: request.message.message_id });
  } catch (e) {}
}

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { keyboard: cancelPrimaryKeyboard, resize_keyboard: true }
});
