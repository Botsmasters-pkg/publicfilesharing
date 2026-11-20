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

if (request && request.chat_join_request) {
  var cId = request.chat_join_request.chat.id.toString();
  var uId = request.chat_join_request.from.id.toString();
  Bot.setProperty("join_req_" + cId + "_" + uId, true, "boolean");
  Bot.setProperty("user_joined_" + cId + "_" + uId, true, "boolean");
  return;
}

if (!user) return;

// Auto-detect Bot username dynamically from Telegram API if not cached
if (!Bot.getProperty("bot_username")) {
  Api.getMe({
    on_result: "/onGetBotUsername"
  });
}

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
var adminState = Bot.getProperty("admin_state_" + user.telegramid, "");

var incomingText = "";
if (request && request.message && request.message.text) {
  incomingText = request.message.text.trim();
} else if (message) {
  incomingText = message.trim();
}

// Global Cancel check for admin states
if (incomingText === "❌ Cancel" || incomingText === "⬅️ Cancel" || incomingText.toLowerCase() === "cancel" || incomingText === "/cancel") {
  if (isAdmin && adminState) {
    Bot.setProperty("admin_state_" + user.telegramid, "", "string");
    Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
    Bot.setProperty("temp_fc_id_" + user.telegramid, "", "string");
    Bot.setProperty("temp_fc_link_" + user.telegramid, "", "string");
    Bot.sendMessage("❌ Operation cancelled.");
    Bot.runCommand("/adminForceChannel");
    return;
  }
}

// Check active admin text states first
if (isAdmin && adminState) {
  // Save raw input to prevent command string overwrite
  Bot.setProperty("temp_last_text_" + user.telegramid, incomingText, "string");

  if (adminState === "waiting_fc_chatid" || adminState === "waiting_fc_public" || adminState === "waiting_fc_channel" || adminState === "waiting_fc_id") {
    Bot.runCommand("/fcSaveChannel " + incomingText);
    return;
  }
  if (adminState === "waiting_fc_link") {
    Bot.runCommand("/fcSaveChannelLink " + incomingText);
    return;
  }
  if (adminState === "waiting_custom_timer") {
    Bot.runCommand("/onFcCustomTimer " + incomingText);
    return;
  }
  if (adminState === "waiting_storage") {
    var storageInput = incomingText;
    if (request && request.message && request.message.forward_from_chat) {
      storageInput = request.message.forward_from_chat.id.toString();
    }
    Bot.runCommand("/onSetStorage " + storageInput);
    return;
  }
  if (adminState === "waiting_welcome") {
    Bot.runCommand("/onSetWelcome " + incomingText);
    return;
  }
  if (adminState === "waiting_broadcast") {
    Bot.runCommand("/onBroadcast " + incomingText);
    return;
  }
  if (adminState === "waiting_support") {
    Bot.runCommand("/onSetSupport " + incomingText);
    return;
  }
}

// Media Upload Check: If user sends or forwards any document, photo, video, audio, or voice
var reqMsg = (request && request.message) ? request.message : request;
var hasMedia = false;
if (reqMsg) {
  if (reqMsg.document || (reqMsg.photo && reqMsg.photo.length > 0) || reqMsg.video || reqMsg.audio || reqMsg.voice || reqMsg.video_note) {
    hasMedia = true;
  }
}
if (!hasMedia && request) {
  if (request.document || (request.photo && request.photo.length > 0) || request.video || request.audio || request.voice || request.video_note) {
    hasMedia = true;
  }
}

if (hasMedia) {
  Bot.runCommand("📝 Upload Files");
  return;
}

// Clone System Email State Handling
if (Bot.getProperty("waiting_clone_email_" + user.telegramid)) {
  if (incomingText === "❌ Cancel" || incomingText.toLowerCase() === "cancel" || incomingText === "/cancel") {
    Bot.setProperty("waiting_clone_email_" + user.telegramid, false, "boolean");
    Bot.sendMessage("❌ Clone request cancelled.");
    Bot.runCommand("/showMenu");
    return;
  }
  Bot.runCommand("/41 " + incomingText);
  return;
}

// User Search State Handling
var searchState = Bot.getProperty("user_search_state_" + user.telegramid, "");
if (searchState === "waiting_search" && incomingText) {
  Bot.setProperty("user_search_state_" + user.telegramid, "", "string");
  if (incomingText === "❌ Cancel" || incomingText.toLowerCase() === "cancel" || incomingText === "/cancel") {
    Bot.runCommand("🗂 My Files");
    return;
  }
  Bot.runCommand("/search " + incomingText);
  return;
}

// User Caption Editing State Handling
var captionState = Bot.getProperty("user_caption_state_" + user.telegramid, "");
if (captionState === "waiting_new_caption" && incomingText) {
  if (incomingText === "❌ Cancel" || incomingText.toLowerCase() === "cancel" || incomingText === "/cancel") {
    Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");
    Bot.runCommand("/keepCaption");
    return;
  }
  // User sent new custom caption
  var draft = Bot.getProperty("temp_upload_" + user.telegramid);
  if (draft) {
    draft.caption = incomingText;
    Bot.setProperty("temp_upload_" + user.telegramid, draft, "json");
  }
  Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");
  Bot.runCommand("/keepCaption");
  return;
}

// User Batch Caption Editing State Handling
var batchCapState = Bot.getProperty("user_batch_caption_state_" + user.telegramid, "");
if (batchCapState === "waiting_batch_caption" && incomingText) {
  Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");
  if (incomingText === "❌ Cancel" || incomingText.toLowerCase() === "cancel" || incomingText === "/cancel" || incomingText.toLowerCase() === "skip") {
    Bot.runCommand("/finishBatch");
    return;
  }
  Bot.setProperty("batch_caption_" + user.telegramid, incomingText, "string");
  Bot.runCommand("/finishBatch");
  return;
}

// Primary Keyboard Button Handling
if (incomingText) {
  var t = incomingText;
  var low = t.toLowerCase();

  // User Verification Button
  if (t === "🔄 Check Membership" || low.indexOf("check membership") !== -1) {
    Bot.runCommand("/checkJoin");
    return;
  }

  // Clone Bot Command (/41 only)
  if (t === "/41" || low === "41" || low.indexOf("/41 ") === 0 || low.indexOf("41 ") === 0) {
    var cloneEmailArg = t.replace(/^\/?41\s*/i, "").trim();
    Bot.runCommand("/41 " + cloneEmailArg);
    return;
  }

  // Bulk Upload Control Buttons (from bottom keyboard)
  if (t === "✅ Done" || low === "done" || t === "/done") {
    Bot.runCommand("/batchDonePrompt");
    return;
  }
  if (t === "❌ Cancel Bulk Upload" || low === "cancel bulk upload") {
    Bot.runCommand("/cancelBatch");
    return;
  }

  // User Primary Keyboard
  if (t === "📝 Upload Files" || low === "upload files") {
    Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
    Bot.setProperty("batch_temp_" + user.telegramid, [], "json");
    Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");
    Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");
    Bot.runCommand("📝 Upload Files");
    return;
  }
  if (t === "🗂 My Files" || low === "my files") {
    Bot.setProperty("user_batch_state_" + user.telegramid, "", "string");
    Bot.setProperty("batch_temp_" + user.telegramid, [], "json");
    Bot.setProperty("user_batch_caption_state_" + user.telegramid, "", "string");
    Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");
    Bot.runCommand("🗂 My Files");
    return;
  }
  if (t === "📦 Bulk Upload" || low === "bulk upload" || t === "/bulk" || low === "bulk" || t === "📦 Batch Link" || low === "batch link" || t === "/batch" || low === "batch") {
    Bot.runCommand("/createBatch");
    return;
  }
  if (t === "/mybatches" || low === "my batches") {
    Bot.runCommand("/mybatches");
    return;
  }
  if (t.indexOf("/search") === 0) {
    var q = t.replace(/^\/search\s*/i, "").trim();
    Bot.runCommand("/search " + q);
    return;
  }
  if (t === "📊 Traffic" || low === "traffic") {
    Bot.runCommand("/traffic");
    return;
  }
  if (t === "🆘 Support" || low === "support") {
    Bot.runCommand("🆘 Support");
    return;
  }
  if (t === "🛠 Admin Panel" || low === "admin panel" || low === "/admin") {
    Bot.runCommand("/admin");
    return;
  }

  // Admin Panel Primary Keyboard
  if (isAdmin) {
    if (t === "📊 Statistics Dashboard" || low.indexOf("statistics") !== -1) {
      Bot.runCommand("/adminStats");
      return;
    }
    if (t === "🔧 Force Channels" || low.indexOf("force channel") !== -1) {
      Bot.runCommand("/adminForceChannel");
      return;
    }
    // Storage Channel Management Controls
    if (t === "⚙️ Set New Storage Channel" || low.indexOf("set new storage") !== -1 || low === "/setnewstorage") {
      Bot.runCommand("/setNewStorage");
      return;
    }
    if (t === "🔄 Restore Default Storage" || t === "⚙️ Restore System Storage" || t === "🔄 Reset to Default Storage" || low.indexOf("restore system storage") !== -1 || low.indexOf("restore default") !== -1 || low.indexOf("reset to default") !== -1 || low === "/resetstoragedefault") {
      Bot.runCommand("/resetStorageDefault");
      return;
    }
    if (t === "🏷️ Storage Channel" || t === "📦 Storage Channel" || low === "storage channel" || low === "🏷️ storage channel" || low === "📦 storage channel" || low === "/storage" || low === "/adminstorage") {
      Bot.runCommand("/adminStorage");
      return;
    }
    if (t === "👋 Welcome Message" || low.indexOf("welcome message") !== -1 || low === "/setwelcome") {
      Bot.runCommand("/adminWelcome");
      return;
    }
    if (t === "📣 Broadcast" || low === "broadcast" || low === "/broadcast") {
      Bot.runCommand("/adminBroadcast");
      return;
    }
    if (low === "/setstorage") {
      Bot.runCommand("/setNewStorage");
      return;
    }
    if (low === "/setforce") {
      Bot.runCommand("/fcAdd");
      return;
    }
    if (t === "💾 CSV Export" || low.indexOf("export") !== -1) {
      Bot.runCommand("/adminExport");
      return;
    }
    if (t === "🆘 Support Management" || low.indexOf("support management") !== -1) {
      Bot.runCommand("/adminSupport");
      return;
    }
    if (t === "🤖 Refresh Bot Info" || low.indexOf("refresh") !== -1) {
      Bot.runCommand("/refreshBotInfo");
      return;
    }
    if (t === "➕ Add Channel" || low.indexOf("add channel") !== -1) {
      Bot.runCommand("/fcAdd");
      return;
    }
    if (t === "⏱️ Set Expiry Timer" || low.indexOf("expiry timer") !== -1) {
      Bot.runCommand("/fcTimerMenu");
      return;
    }
    if (t === "📄 List Channels" || low.indexOf("list channel") !== -1) {
      Bot.runCommand("/fcList");
      return;
    }
    // Specific channel remove confirmation (e.g. "🗑️ Yes, Remove Channel 4")
    var chConfirmMatch = t.match(/Yes[,\s]+(?:Remove\s+Channel|Remove)\s+(\d+)/i);
    if (chConfirmMatch) {
      var cIdx = parseInt(chConfirmMatch[1]) - 1;
      Bot.runCommand("/fcRemoveConfirm " + cIdx);
      return;
    }

    // Specific channel remove prompt (e.g. "❌ Remove Channel 4")
    var chRemoveMatch = t.match(/^[❌\s]*Remove\s+Channel\s+(\d+)/i);
    if (chRemoveMatch) {
      var rIdx = parseInt(chRemoveMatch[1]) - 1;
      Bot.runCommand("/fcRemovePrompt " + rIdx);
      return;
    }

    if (t === "❌ Remove Channel" || low === "remove channel" || low === "/removechannel") {
      Bot.runCommand("/fcRemoveMenu");
      return;
    }
    if (t === "⬅️ Back to Admin Panel" || low.indexOf("back to admin") !== -1) {
      Bot.runCommand("/admin");
      return;
    }
    if (t === "⬅️ Back to Main Menu" || low.indexOf("back to main") !== -1) {
      Bot.runCommand("/showMenu");
      return;
    }

    // Force Channel Type Selection (Primary Keyboard)
    if (t === "📢 Public Channel" || low.indexOf("public channel") !== -1) {
      Bot.runCommand("/fcStepType public");
      return;
    }
    if (t === "🔒 Private Channel" || low.indexOf("private channel") !== -1) {
      Bot.runCommand("/fcStepType private");
      return;
    }
    if (t === "📩 Private Request Channel" || low.indexOf("request channel") !== -1) {
      Bot.runCommand("/fcStepType request");
      return;
    }
    if (t === "⬅️ Cancel & Back" || low.indexOf("cancel & back") !== -1) {
      Bot.runCommand("/adminForceChannel");
      return;
    }
    if (t === "⬅️ Back to Force Channels" || low.indexOf("back to force") !== -1) {
      Bot.runCommand("/adminForceChannel");
      return;
    }
    if (t === "🗑️ Clear All Channels" || low.indexOf("clear all") !== -1) {
      Bot.runCommand("/clearForce");
      return;
    }

    // Force Channel Timer Selection (Primary Keyboard)
    var chTimerMatch = t.match(/^⏱️\s*Channel\s*(\d+)/i);
    if (chTimerMatch) {
      var cIdx = parseInt(chTimerMatch[1]) - 1;
      Bot.runCommand("/fcSelectTimer " + cIdx);
      return;
    }

    var currentTimerIdx = Bot.getProperty("temp_fc_custom_idx_" + user.telegramid, 0);
    if (t === "⏱️ 5 Minutes" || low === "5 minutes") {
      Bot.runCommand("/fcApplyTimer " + currentTimerIdx + " 5");
      return;
    }
    if (t === "⏱️ 10 Minutes" || low === "10 minutes") {
      Bot.runCommand("/fcApplyTimer " + currentTimerIdx + " 10");
      return;
    }
    if (t === "⏱️ 30 Minutes" || low === "30 minutes") {
      Bot.runCommand("/fcApplyTimer " + currentTimerIdx + " 30");
      return;
    }
    if (t === "⏱️ 1 Hour" || low === "1 hour") {
      Bot.runCommand("/fcApplyTimer " + currentTimerIdx + " 60");
      return;
    }
    if (t === "⏱️ 1 Day" || low === "1 day") {
      Bot.runCommand("/fcApplyTimer " + currentTimerIdx + " 1440");
      return;
    }
    if (t === "✏️ Custom Timer" || low.indexOf("custom timer") !== -1) {
      Bot.runCommand("/fcCustomTimer " + currentTimerIdx);
      return;
    }
    if (t === "♾️ Permanent (Turn Off)" || low.indexOf("permanent") !== -1) {
      Bot.runCommand("/fcApplyTimer " + currentTimerIdx + " 0");
      return;
    }

    // Force Channel Remove (Primary Keyboard)
    var chRemoveMatch = t.match(/^❌\s*Remove\s*Channel\s*(\d+)/i);
    if (chRemoveMatch) {
      var rIdx = parseInt(chRemoveMatch[1]) - 1;
      Bot.runCommand("/fcRemovePrompt " + rIdx);
      return;
    }
  }

  // General text fallback
  if (t === "/start") {
    Bot.runCommand("/start");
    return;
  }
}
