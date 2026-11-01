/*CMD
  command: /onApproveSuccess
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
  Bot.setProperty("join_req_" + ch.id + "_" + user.telegramid, true, "boolean");
}

// Join request was successfully approved by Telegram! User is verified!
Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
