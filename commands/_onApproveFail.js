/*CMD
  command: /onApproveFail
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

var err = (options && options.error) ? (options.error.description || JSON.stringify(options.error)) : "";

// If user is already a participant, treat as verified
if (err.indexOf("USER_ALREADY_PARTICIPANT") !== -1) {
  Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
  return;
}

// Check if user previously sent request
var hasReq = ch ? Bot.getProperty("join_req_" + ch.id + "_" + user.telegramid) : false;
if (hasReq) {
  Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
  return;
}

// Otherwise not joined/requested yet
var unjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);
unjoined.push(ch);
Bot.setProperty("verify_unjoined_" + user.telegramid, unjoined, "json");

Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
