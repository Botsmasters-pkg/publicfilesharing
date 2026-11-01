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
  var forceChannels = Bot.getProperty("forceChannels", []);
  var now = Date.now();
  var activeChannels = [];

  for (var i = 0; i < forceChannels.length; i++) {
    var ch = forceChannels[i];
    if (!ch.expired && (ch.expiryTime === 0 || now < ch.expiryTime)) {
      activeChannels.push(ch);
    }
  }

  // Legacy fallback
  var legacyForce = Bot.getProperty("forceChannel");
  if (legacyForce && activeChannels.length === 0) {
    activeChannels.push({
      id: legacyForce,
      name: "Channel",
      link: legacyForce.indexOf("http") === 0 ? legacyForce : ("https://t.me/" + legacyForce.replace("@", ""))
    });
  }

  var checkParam = (params && params.trim() !== "") ? params.trim() : "none";

  // Build strictly 2x2 Grid with buttons named "JOIN"
  var grid = [];
  var currentRow = [];

  for (var j = 0; j < activeChannels.length; j++) {
    var link = activeChannels[j].link || ("https://t.me/" + activeChannels[j].id.replace("@", ""));
    if (link.indexOf("http") !== 0) {
      link = "https://t.me/" + link.replace("@", "");
    }
    currentRow.push({
      text: "JOIN",
      url: link
    });

    if (currentRow.length === 2) {
      grid.push(currentRow);
      currentRow = [];
    }
  }
  if (currentRow.length > 0) {
    grid.push(currentRow);
  }

  // Add the Verify / Proceed button below the 2x2 grid
  grid.push([
    { text: "🔄 Joined (Verify)", callback_data: "/checkJoin " + checkParam }
  ]);

  var alertMsg = "⚠️ *Must Join Our Channel To Continue!*\n`———————————————————————`\n\n" +
    "You must join our mandatory channel(s) before you can access this bot or download files.\n\n" +
    "👉 Click *JOIN* below, join the channel(s), and then click *Joined (Verify)*:";

  Api.sendMessage({
    text: alertMsg,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: grid }
  });
}
