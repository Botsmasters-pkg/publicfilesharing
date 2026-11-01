/*CMD
  command: /verifyStep
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var parts = (params || "").split(" ");
var index = parseInt(parts[0] || "0");
var checkParam = parts.slice(1).join(" ") || "none";

var queue = Bot.getProperty("verify_queue_" + user.telegramid, []);

if (index >= queue.length) {
  // All channels verified!
  var unjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);

  if (unjoined.length === 0) {
    // 🟢 Requirement #4: All Channels Verified Successfully!
    var successMsg = "🟢 *All Channels Verified Successfully!*\n`———————————————————————`\n\n" +
      "Thank you! You now have full access to use the bot.";

    Api.sendMessage({
      text: successMsg,
      parse_mode: "Markdown"
    });

    if (checkParam !== "none") {
      Bot.runCommand("/downloadDirect " + checkParam);
    } else {
      Bot.runCommand("/showMenu");
    }
  } else {
    // Some channels are still unjoined: Show ONLY remaining unjoined channels!
    var msg = "📢 *Join Required Channel" + (unjoined.length > 1 ? "s" : "") + "*\n`———————————————————————`\n\n" +
      "You must join the following required channel" + (unjoined.length > 1 ? "s" : "") + " before you can access the bot:\n\n";

    var grid = [];
    var row = [];

    for (var i = 0; i < unjoined.length; i++) {
      var uCh = unjoined[i];
      var uLink = uCh.link || ("https://t.me/" + uCh.id.replace("@", ""));
      if (uLink.indexOf("http") !== 0) {
        uLink = "https://t.me/" + uLink.replace("@", "");
      }

      row.push({
        text: "JOIN",
        url: uLink
      });

      if (row.length === 2) {
        grid.push(row);
        row = [];
      }
    }
    if (row.length > 0) {
      grid.push(row);
    }

    grid.push([
      { text: "🔄 Check Membership", callback_data: "/checkJoin " + checkParam }
    ]);

    Api.sendMessage({
      text: msg,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: grid }
    });
  }
  return;
}

var ch = queue[index];

// Check membership for queue[index]
Api.getChatMember({
  chat_id: ch.id,
  user_id: user.telegramid,
  on_result: "/onVerifyResult " + index + " " + checkParam,
  on_error: "/onVerifyError " + index + " " + checkParam
});
