/*CMD
  command: /onSetStorage
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!user) return;

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || user.is_admin;
if (!isAdmin) return;

function escapeHtml(str) {
  if (!str) return "";
  return str.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

var text = "";
if (request && request.message && request.message.forward_from_chat) {
  text = request.message.forward_from_chat.id.toString();
} else if (params && params.trim() !== "") {
  text = params.trim();
} else if (request && request.message && request.message.text) {
  text = request.message.text.trim();
} else {
  text = Bot.getProperty("temp_last_text_" + user.telegramid, "");
}

text = text.replace(/^\/onSetStorage\s*/i, "").trim();

if (!text) return;

// Cancel check
if (text === "❌ Cancel" || text === "/cancel" || text.toLowerCase() === "cancel" || text === "⬅️ Cancel") {
  Bot.setProperty("admin_state_" + user.telegramid, "", "string");
  Bot.setProperty("temp_last_text_" + user.telegramid, "", "string");
  Api.sendMessage({
    text: "❌ <b>Channel configuration cancelled.</b>\nActive storage channel remains unchanged.",
    parse_mode: "HTML"
  });
  Bot.runCommand("/adminStorage");
  return;
}

// Quick Reset check
if (text === "🔄 Restore Default Storage" || text === "⚙️ Restore System Storage" || text === "🔄 Reset to Default Storage" || text === "/resetStorageDefault") {
  Bot.runCommand("/resetStorageDefault");
  return;
}

// Strict Format Validation & Normalization
var candidateId = "";

if (text.indexOf("https://t.me/") === 0 || text.indexOf("http://t.me/") === 0 || text.indexOf("t.me/") === 0) {
  var cleanUser = text.replace(/https?:\/\/t\.me\//i, "").replace("@", "").replace(/\/.*/, "").trim();
  if (cleanUser && cleanUser.match(/^[a-zA-Z0-9_]{4,32}$/) && !cleanUser.startsWith("+")) {
    candidateId = "@" + cleanUser;
  }
} else if (text.startsWith("@")) {
  var userHandle = text.replace("@", "").trim();
  if (userHandle.match(/^[a-zA-Z0-9_]{4,32}$/)) {
    candidateId = "@" + userHandle;
  }
} else if (text.match(/^-?100\d{8,}$/)) {
  candidateId = text.startsWith("-") ? text : ("-" + text);
} else if (text.match(/^\d{8,}$/)) {
  candidateId = "-100" + text;
} else if (text.match(/^-\d{8,}$/)) {
  candidateId = "-100" + text.replace(/^-/, "");
}

// If format is invalid (random text, website link, etc.), reject immediately!
if (!candidateId) {
  var rejectMsg = "⚠️ <b>Invalid Channel Format!</b>\n" +
    "<code>———————————————————————</code>\n\n" +
    "You provided: <code>" + escapeHtml(text) + "</code>\n\n" +
    "❌ Random links, websites, group IDs, or arbitrary text are not accepted.\n\n" +
    "👉 <b>Acceptable Formats:</b>\n" +
    "• Numeric Channel ID: <code>-1003946288718</code>\n" +
    "• Public Username: <code>@MyChannel</code>\n" +
    "• Or simply <b>Forward any post</b> from your storage channel here!\n\n" +
    "<i>Please send a valid channel ID or tap ❌ Cancel below.</i>";

  Api.sendMessage({
    text: rejectMsg,
    parse_mode: "HTML",
    reply_markup: {
      keyboard: [[{ text: "❌ Cancel", style: "primary" }]],
      resize_keyboard: true
    }
  });
  return;
}

// Notify admin that live verification is starting
Api.sendMessage({
  text: "🔍 <b>Verifying Channel Destination...</b>\n\n" +
    "• Testing target: <code>" + escapeHtml(candidateId) + "</code>\n" +
    "• Verifying bot administrator access &amp; posting permissions...",
  parse_mode: "HTML"
});

// Perform live permission verification via Telegram API test post
try {
  Api.sendMessage({
    chat_id: candidateId,
    text: "🤖 <b>Storage Channel Verification Ping</b>\n<i>Verifying bot post permissions...</i>",
    parse_mode: "HTML",
    on_result: "/onStorageVerifySuccess " + candidateId,
    on_error: "/onStorageVerifyError " + candidateId
  });
} catch (e) {
  Bot.runCommand("/onStorageVerifyError " + candidateId);
}
