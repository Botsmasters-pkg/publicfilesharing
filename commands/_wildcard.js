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

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function balanceTelegramHtml(html, isMedia) {
  if (!html) return "";
  var str = html.toString();
  if (isMedia) {
    str = str.replace(/<\/?(?:blockquote|expandable_blockquote)[^>]*>/gi, "");
  }
  var tagRegex = /<\/?([a-z0-9_-]+)(?:\s+[^>]*)?>/gi;
  var result = "";
  var lastIndex = 0;
  var stack = [];
  var match;
  var allowedTags = isMedia 
    ? ["b", "strong", "i", "em", "u", "ins", "s", "strike", "del", "code", "pre", "tg-spoiler", "a"]
    : ["b", "strong", "i", "em", "u", "ins", "s", "strike", "del", "code", "pre", "tg-spoiler", "a", "blockquote", "expandable_blockquote"];

  while ((match = tagRegex.exec(str)) !== null) {
    var fullTag = match[0];
    var tagName = match[1].toLowerCase();
    var isClose = fullTag.charAt(1) === '/';

    result += str.slice(lastIndex, match.index);
    lastIndex = tagRegex.lastIndex;

    if (allowedTags.indexOf(tagName) === -1) {
      continue;
    }

    if (!isClose) {
      stack.push(tagName);
      result += fullTag;
    } else {
      var stackIdx = stack.lastIndexOf(tagName);
      if (stackIdx !== -1) {
        while (stack.length - 1 > stackIdx) {
          var unclosed = stack.pop();
          result += "</" + unclosed + ">";
        }
        stack.pop();
        result += "</" + tagName + ">";
      }
    }
  }

  result += str.slice(lastIndex);
  while (stack.length > 0) {
    var rem = stack.pop();
    result += "</" + rem + ">";
  }
  return result;
}

function formatCaptionWithLinks(text, entities) {
  if (!text) return "";

  if (entities && Array.isArray(entities) && entities.length > 0) {
    var tagMap = {
      "bold": ["<b>", "</b>"],
      "italic": ["<i>", "</i>"],
      "code": ["<code>", "</code>"],
      "pre": ["<pre>", "</pre>"],
      "underline": ["<u>", "</u>"],
      "strikethrough": ["<s>", "</s>"],
      "spoiler": ["<tg-spoiler>", "</tg-spoiler>"]
    };

    var events = [];
    for (var i = 0; i < entities.length; i++) {
      var ent = entities[i];
      var openTag = "";
      var closeTag = "";

      if (tagMap[ent.type]) {
        openTag = tagMap[ent.type][0];
        closeTag = tagMap[ent.type][1];
      } else if (ent.type === "text_link" && ent.url) {
        openTag = '<a href="' + ent.url.replace(/"/g, '&quot;') + '">';
        closeTag = "</a>";
      } else if (ent.type === "text_mention" && ent.user) {
        openTag = '<a href="tg://user?id=' + ent.user.id + '">';
        closeTag = "</a>";
      }

      if (openTag && closeTag) {
        var start = ent.offset;
        var len = ent.length;
        events.push({
          id: i,
          start: start,
          end: start + len,
          len: len,
          open: openTag,
          close: closeTag
        });
      }
    }

    if (events.length > 0) {
      var points = [0, text.length];
      for (var p = 0; p < events.length; p++) {
        points.push(events[p].start);
        points.push(events[p].end);
      }
      points.sort(function(a, b) { return a - b; });
      var uniquePoints = [];
      for (var u = 0; u < points.length; u++) {
        if (u === 0 || points[u] !== points[u - 1]) {
          uniquePoints.push(points[u]);
        }
      }

      var res = "";
      var stack = [];

      for (var s = 0; s < uniquePoints.length - 1; s++) {
        var pStart = uniquePoints[s];
        var pEnd = uniquePoints[s + 1];
        if (pStart >= text.length) break;

        var activeCovering = [];
        for (var e = 0; e < events.length; e++) {
          if (events[e].start <= pStart && events[e].end >= pEnd) {
            activeCovering.push(events[e]);
          }
        }
        activeCovering.sort(function(a, b) {
          if (a.len !== b.len) return b.len - a.len;
          return a.id - b.id;
        });

        var matchLen = 0;
        while (matchLen < stack.length && matchLen < activeCovering.length && stack[matchLen].id === activeCovering[matchLen].id) {
          matchLen++;
        }

        while (stack.length > matchLen) {
          res += stack.pop().close;
        }

        while (stack.length < activeCovering.length) {
          var op = activeCovering[stack.length];
          res += op.open;
          stack.push(op);
        }

        res += escapeHtml(text.slice(pStart, pEnd));
      }

      while (stack.length > 0) {
        res += stack.pop().close;
      }

      return balanceTelegramHtml(res, true);
    }
  }

  // 2. Process Markdown hyperlinks like [text](https://example.com)
  if (/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/.test(text)) {
    var lastIdx = 0;
    var regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    var match;
    var res = "";
    while ((match = regex.exec(text)) !== null) {
      res += escapeHtml(text.slice(lastIdx, match.index));
      res += '<a href="' + match[2].replace(/"/g, '&quot;') + '">' + escapeHtml(match[1]) + '</a>';
      lastIdx = regex.lastIndex;
    }
    res += escapeHtml(text.slice(lastIdx));
    return balanceTelegramHtml(res, true);
  }

  // 3. Raw HTML with anchor tag
  if (/<a\s+href=["'][^"']+["']>.*?<\/a>/i.test(text)) {
    return balanceTelegramHtml(text, true);
  }

  return escapeHtml(text);
}

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
  Bot.setProperty("user_caption_state_" + user.telegramid, "", "string");
  if (incomingText === "❌ Cancel" || incomingText.toLowerCase() === "cancel" || incomingText === "/cancel") {
    Bot.sendMessage("❌ Caption edit cancelled.");
    return;
  }
  var rawCapText = (reqMsg && reqMsg.text) || incomingText;
  var capEnts = (reqMsg && reqMsg.entities) || (request && request.entities) || [];
  var formattedCaption = formatCaptionWithLinks(rawCapText, capEnts);

  var targetFileKey = Bot.getProperty("caption_target_file_" + user.telegramid, "");
  if (targetFileKey) {
    var fRec = Bot.getProperty("file_" + targetFileKey);
    if (fRec) {
      fRec.caption = formattedCaption;
      Bot.setProperty("file_" + targetFileKey, fRec, "json");
      if (fRec.fileId) Bot.setProperty("file_" + fRec.fileId, fRec, "json");
      if (fRec.telegramUniqueId) Bot.setProperty("file_" + fRec.telegramUniqueId, fRec, "json");
      Bot.setProperty(user.telegramid + "" + targetFileKey, fRec, "json");

      var uFiles = Bot.getProperty("userFiles_" + user.telegramid, []);
      if (Array.isArray(uFiles)) {
        for (var fi = 0; fi < uFiles.length; fi++) {
          if (uFiles[fi].uniqueKey === targetFileKey || uFiles[fi].fileUniqueId === targetFileKey) {
            uFiles[fi].caption = formattedCaption;
            break;
          }
        }
        Bot.setProperty("userFiles_" + user.telegramid, uFiles, "json");
      }
    }
    Bot.setProperty("caption_target_file_" + user.telegramid, "", "string");
  }
  Bot.sendMessage("✅ <b>Caption updated successfully!</b>\n\n<b>New Caption:</b>\n" + formattedCaption, { parse_mode: "HTML" });
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
  var rawBatchText = (reqMsg && reqMsg.text) || incomingText;
  var batchEnts = (reqMsg && reqMsg.entities) || (request && request.entities) || [];
  var formattedBatchCap = formatCaptionWithLinks(rawBatchText, batchEnts);
  Bot.setProperty("batch_caption_" + user.telegramid, formattedBatchCap, "string");
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
    Bot.runCommand("/finishBatch");
    return;
  }
  if (t === "❌ Cancel" || low === "cancel" || t === "/cancel" || t === "❌ Cancel Bulk Upload" || low === "cancel bulk upload") {
    if (Bot.getProperty("user_batch_state_" + user.telegramid) === "active") {
      Bot.runCommand("/cancelBatch");
      return;
    }
  }

  // Upload Routing
  if (t === "📄 Single Upload" || low === "single upload" || t === "/single") {
    Bot.runCommand("/setUploadSingle");
    return;
  }
  if (t === "📝 Upload Files" || low === "upload files" || t === "/upload") {
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
