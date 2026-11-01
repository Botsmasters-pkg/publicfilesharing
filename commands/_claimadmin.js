/*CMD
  command: /claimadmin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: /claimAdmin
  group: 
CMD*/

Bot.setProperty("admin_id", user.telegramid);
Bot.setProperty("admin_" + user.telegramid, true);

var keyb = [
  [{ text: "🛠 Open Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "👑 *Success! You are now registered as the Bot Admin!*\n\nYour Telegram ID: `" + user.telegramid + "`\n\nYou can now use /admin and see the *🛠 Admin Panel* button in /start.",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
