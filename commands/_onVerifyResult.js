/*CMD
  command: /onVerifyResult
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

var status = options.result ? options.result.status : "";
var isMember = (status === "member" || status === "administrator" || status === "creator");

if (isMember) {
  // Verified! Proceed to next channel
  Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
} else {
  // If join request channel
  if (ch && ch.type === "request") {
    var hasReq = Bot.getProperty("join_req_" + ch.id + "_" + user.telegramid);
    if (hasReq) {
      // Verified by join request!
      Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
      return;
    }

    // Try approving pending request
    Api.approveChatJoinRequest({
      chat_id: ch.id,
      user_id: user.telegramid,
      on_result: "/onApproveSuccess " + index + " " + checkParam,
      on_error: "/onApproveFail " + index + " " + checkParam
    });
  } else {
    // Not a member: record in unjoined list
    var unjoined = Bot.getProperty("verify_unjoined_" + user.telegramid, []);
    unjoined.push(ch);
    Bot.setProperty("verify_unjoined_" + user.telegramid, unjoined, "json");

    Bot.runCommand("/verifyStep " + (index + 1) + " " + checkParam);
  }
}
