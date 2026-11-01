/*CMD
  command: /shareFile
  help: 
  need_reply: 
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!params) {
  return
}
var shareLink =
  "https://t.me/" + bot.name + "?start=" + user.telegramid + "" + params
var shareButton = [
  [{ text: "Share", url: "https://t.me/share/url?text=" + shareLink }]
]
Api.sendMessage({
  text:
    "_Press The Button Or Click To Copy The Link Below To Share Your Files!_\n\n`" +
    shareLink +
    "`",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: shareButton }
})

