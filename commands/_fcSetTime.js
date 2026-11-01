/*CMD
  command: /fcSetTime
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

var minutes = parseInt(params);
var name = Bot.getProperty("temp_fc_name_" + user.telegramid, "Channel");
var id = Bot.getProperty("temp_fc_id_" + user.telegramid, "");
var type = Bot.getProperty("temp_fc_type_" + user.telegramid, "public");
var link = Bot.getProperty("temp_fc_link_" + user.telegramid, "");

var now = Date.now();
var expiryTime = minutes > 0 ? (now + minutes * 60 * 1000) : 0;

var channelObj = {
  id: id,
  name: name,
  type: type,
  link: link,
  configuredMinutes: minutes,
  addedAt: now,
  expiryTime: expiryTime,
  expired: false
};

var forceChannels = Bot.getProperty("forceChannels", []);
// Check if channel already exists and update, or push new
var updated = false;
for (var i = 0; i < forceChannels.length; i++) {
  if (forceChannels[i].id === id) {
    forceChannels[i] = channelObj;
    updated = true;
    break;
  }
}
if (!updated) {
  forceChannels.push(channelObj);
}
Bot.setProperty("forceChannels", forceChannels, "json");

var expiryTxt = minutes > 0 ? (minutes + " Minutes (Auto-Expires at " + new Date(expiryTime).toISOString().slice(11, 16) + " UTC)") : "Permanent (No Expiry)";

var successMsg = "✅ *Force Channel Saved Successfully!*\n`———————————————————————`\n" +
  "🏷️ *Name:* *" + name + "*\n" +
  "🆔 *ID:* `" + id + "`\n" +
  "📁 *Type:* `" + type.toUpperCase() + "`\n" +
  "🔗 *Link:* " + link + "\n" +
  "⏱ *Active Timer:* *" + expiryTxt + "*\n\n" +
  "_This channel is now actively monitored in the normal user panel._";

var keyb = [
  [{ text: "📄 View All Channels", callback_data: "/fcList" }],
  [{ text: "⬅️ Back to Force Channels", callback_data: "/adminForceChannel" }]
];

if (request.data) {
  Api.editMessageText({
    message_id: request.message.message_id,
    text: successMsg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
} else {
  Api.sendMessage({
    text: successMsg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
