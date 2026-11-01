/*CMD
  command: /fcStepLink
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
if (!isAdmin) return;

if (!message) return;
var link = message.trim();
if (link === "❌ Cancel" || link === "/cancel") {
  Bot.runCommand("/adminForceChannel");
  return;
}

Bot.setProperty("temp_fc_link_" + user.telegramid, link, "string");

var msg = "➕ *Add New Force Channel (Step 5/5)*\n`———————————————————————`\n\n" +
  "👉 *Select Active Time (Auto-Expiry Timer):*\n\n" +
  "_The channel will automatically disappear from the user panel after this timer expires._";

var keyb = [
  [
    { text: "⏱ 5 Minutes", callback_data: "/fcSetTime 5" },
    { text: "⏱ 10 Minutes", callback_data: "/fcSetTime 10" }
  ],
  [
    { text: "⏱ 15 Minutes", callback_data: "/fcSetTime 15" },
    { text: "⏱ 30 Minutes", callback_data: "/fcSetTime 30" }
  ],
  [
    { text: "⏱ 1 Hour", callback_data: "/fcSetTime 60" },
    { text: "⏱ 2 Hours", callback_data: "/fcSetTime 120" }
  ],
  [
    { text: "⏱ 6 Hours", callback_data: "/fcSetTime 360" },
    { text: "⏱ 12 Hours", callback_data: "/fcSetTime 720" }
  ],
  [
    { text: "⏱ 24 Hours", callback_data: "/fcSetTime 1440" },
    { text: "♾ Permanent (No Expiry)", callback_data: "/fcSetTime 0" }
  ],
  [
    { text: "⏳ Custom Time (Hours & Mins)", callback_data: "/fcCustomTime" }
  ],
  [
    { text: "⬅️ Cancel", callback_data: "/adminForceChannel" }
  ]
];

Api.sendMessage({
  text: msg,
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
