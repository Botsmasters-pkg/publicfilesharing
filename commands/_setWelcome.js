/*CMD
  command: /setWelcome
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

if (!params) {
  Api.sendMessage({
    text: "⚠️ <b>Please write the new welcome text.</b>\n<i>Example:</i> <code>/setWelcome Hello! Welcome to our Bot.</code>",
    parse_mode: "HTML"
  });
  return;
}

Bot.setProperty("welcomeMessage", {
  type: "text",
  text: params.trim(),
  media: "",
  caption: ""
}, "json");

Api.sendMessage({
  text: "✅ <b>Welcome message updated successfully!</b>",
  parse_mode: "HTML"
});
