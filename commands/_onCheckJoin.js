/*CMD
  command: /onCheckJoin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var status = options.result ? options.result.status : "";
var isMember = (status === "member" || status === "administrator" || status === "creator");

if (isMember) {
  if (params && params.trim() !== "" && params.trim() !== "none") {
    Bot.runCommand("/downloadDirect " + params.trim());
  } else {
    Bot.runCommand("/showMenu");
  }
} else {
  var forceChannel = Bot.getProperty("forceChannel", "");
  var cleanName = forceChannel.replace("@", "");
  var joinUrl = forceChannel.indexOf("http") === 0 ? forceChannel : ("https://t.me/" + cleanName);
  var checkParam = (params && params.trim() !== "") ? params.trim() : "none";

  var keyb = [
    [{ text: "📢 Join Channel", url: joinUrl }],
    [{ text: "🔄 Joined (Verify)", callback_data: "/checkJoin " + checkParam }]
  ];

  Api.sendMessage({
    text: "⚠️ *Access Denied!*\n\nYou must join our official channel to use this bot and download files.\nPlease join below and click *Joined (Verify)*.",
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyb }
  });
}
