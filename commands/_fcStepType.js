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
  msg = "📢 <b>Add Public Channel</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "👉 <b>Send the Channel Username or Public Link:</b>\n" +
    "• Username: <code>@MyChannel</code>\n" +
    "• Public Link: <code>https://t.me/MyChannel</code>\n" +
    "• Or simply forward any post from that channel here!\n\n" +
    "<i>(Make sure the bot is added as Administrator in the channel)</i>";
} else if (type === "request") {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_chatid", "string");
  msg = "📩 <b>Add Private Join Request Channel (Step 1/2)</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "👉 <b>Send the Numeric Chat ID of this Channel:</b>\n" +
    "• Example: <code>-1004307092136</code>\n" +
    "• Or simply forward any post from that channel here to auto-detect ID!\n\n" +
    "<i>(After sending Chat ID, the bot will ask for the Join Request Invite Link in Step 2)</i>";
} else {
  Bot.setProperty("admin_state_" + user.telegramid, "waiting_fc_chatid", "string");
  msg = "🔒 <b>Add Private Channel (Step 1/2)</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "👉 <b>Send the Numeric Chat ID of this Channel:</b>\n" +
    "• Example: <code>-1004307092136</code>\n" +
    "• Or simply forward any post from that channel here to auto-detect ID!\n\n" +
    "<i>(After sending Chat ID, the bot will ask for the Private Invite Link in Step 2)</i>";
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
  chat_id: (typeof chat !== "undefined" && chat && chat.chatid) ? chat.chatid : (typeof user !== "undefined" && user && user.telegramid ? user.telegramid : null),
  text: msg,
  parse_mode: "HTML",
  reply_markup: { keyboard: cancelPrimaryKeyboard, resize_keyboard: true }
});
