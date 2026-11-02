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

var parts = (params || "").split(" ");
var index = parseInt(parts[0] || "0");
var checkParam = parts.slice(1).join(" ") || "none";

var queue = Bot.getProperty("verify_queue_" + user.telegramid, []);
var ch = queue[index];

if (ch) {
  var status = (options && options.result) ? options.result.status : "";
  var isMember = (status === "member" || status === "administrator" || status === "creator");

  if (isMember) {
    // Channel is joined!
  } else if (ch.type === "request") {
    var hasReq = Bot.getProperty("join_req_" + ch.id + "_" + user.telegramid);
    if (hasReq) {
      // Join request received: verified immediately!
    } else {
      var unjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);
      unjoined.push(ch);
      Bot.setProperty("verify_unjoined_" + user.telegramid, unjoined, "json");
    }
  } else {
    // Channel not joined: add to unjoined list
    var unjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);
    unjoined.push(ch);
    Bot.setProperty("verify_unjoined_" + user.telegramid, unjoined, "json");
  }
}

var nextIndex = index + 1;

if (nextIndex < queue.length) {
  // Check next channel directly with Api.getChatMember without Bot.runCommand nesting!
  var nextChannel = queue[nextIndex];
  Api.getChatMember({
    chat_id: nextChannel.id,
    user_id: user.telegramid,
    on_result: "/onCheckJoin " + nextIndex + " " + checkParam,
    on_error: "/onCheckJoin " + nextIndex + " " + checkParam
  });
} else {
  // All channels checked!
  var finalUnjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);

  if (finalUnjoined.length === 0) {
    // 🟢 All Channels Verified Successfully!
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
    // Show remaining unjoined channels only!
    var msg = "📢 *Join Required Channel" + (finalUnjoined.length > 1 ? "s" : "") + "*\n`———————————————————————`\n\n" +
      "You must join the following required channel" + (finalUnjoined.length > 1 ? "s" : "") + " before you can access the bot:\n\n";

    var grid = [];
    var row = [];

    for (var i = 0; i < finalUnjoined.length; i++) {
      var uCh = finalUnjoined[i];
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

    Api.sendMessage({
      text: "👇 *Or tap the button below to verify membership:*",
      parse_mode: "Markdown",
      reply_markup: {
        keyboard: [
          [{ text: "🔄 Check Membership", style: "primary" }]
        ],
        resize_keyboard: true
      }
    });
  }
}
