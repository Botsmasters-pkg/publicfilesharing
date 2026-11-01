/*CMD
  command: /onVerifyError
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

// If join request channel, try approving
if (ch && ch.type === "request") {
  var hasReq = Bot.getProperty("join_req_" + ch.id + "_" + user.telegramid);
  if (hasReq) {
    Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
    return;
  }

  Api.approveChatJoinRequest({
    chat_id: ch.id,
    user_id: user.telegramid,
    on_result: "/onApproveSuccess " + index + " " + checkParam,
    on_error: "/onApproveFail " + index + " " + checkParam
  });
  return;
}

// Otherwise add to unjoined
var unjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);
unjoined.push(ch);
Bot.setProperty("verify_unjoined_" + user.telegramid, unjoined, "json");

Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
