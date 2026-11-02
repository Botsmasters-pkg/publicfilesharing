/*CMD
  command: /setStorage
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

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

if (!params) {
  Api.sendMessage({
    text: "⚠️ <b>Please provide channel ID or @username.</b>\n<i>Example:</i> <code>/setStorage @mychannel</code>",
    parse_mode: "HTML"
  });
  return;
}

Bot.setProperty("storageChannel", params.trim(), "string");
Api.sendMessage({
  text: "✅ <b>Storage Channel has been set to:</b> <code>" + escapeHtml(params.trim()) + "</code>\nAll new uploaded files will be backed up here.",
  parse_mode: "HTML"
});
