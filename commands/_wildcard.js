/*CMD
  command: *
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
var adminState = Bot.getProperty("admin_state_" + user.telegramid, "");

if (isAdmin && adminState) {
  if (adminState === "waiting_fc_channel") {
    Bot.runCommand("/fcSaveChannel");
    return;
  }
  if (adminState === "waiting_fc_link") {
    Bot.runCommand("/fcSaveChannelLink");
    return;
  }
  if (adminState === "waiting_custom_timer") {
    Bot.runCommand("/onFcCustomTimer");
    return;
  }
  if (adminState === "waiting_storage") {
    Bot.runCommand("/onSetStorage");
    return;
  }
  if (adminState === "waiting_welcome") {
    Bot.runCommand("/onSetWelcome");
    return;
  }
  if (adminState === "waiting_broadcast") {
    Bot.runCommand("/onBroadcast");
    return;
  }
  if (adminState === "waiting_support") {
    Bot.runCommand("/onSetSupport");
    return;
  }
}

// Direct File Upload Support: if any user sends a document, photo, video, or audio
if (request.document || (request.photo && request.photo.length > 0) || request.video || request.audio) {
  Bot.runCommand("📝 Upload Files");
  return;
}

// Text fallback
if (message) {
  var clean = message.trim().toLowerCase();
  if (clean === "start" || clean === "menu" || clean === "help") {
    Bot.runCommand("/showMenu");
    return;
  }
}
