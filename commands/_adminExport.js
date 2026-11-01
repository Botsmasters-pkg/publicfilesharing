/*CMD
  command: /adminExport
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

var isAdmin = (user.telegramid == 8710308658 || user.telegramid == "8710308658") || (user.telegramid == Bot.getProperty("admin_id")) || (Bot.getProperty("admin_" + user.telegramid) == true) || user.is_admin;
if (!isAdmin) return;

var allUsers = Bot.getProperty("allBotUsers", []);
var allFiles = Bot.getProperty("allBotFiles", []);

var csv = "=== BOT USERS EXPORT ===\n";
csv += "User_ID,First_Name,Username,Joined_At\n";

for (var i = 0; i < allUsers.length; i++) {
  var uid = allUsers[i];
  var uInfo = Bot.getProperty("userInfo_" + uid, { first_name: "", username: "", joined_at: "" });
  csv += uid + ',"' + (uInfo.first_name || "").replace(/"/g, '""') + '","' + (uInfo.username || "") + '","' + (uInfo.joined_at || "") + '"\n';
}

csv += "\n=== BOT FILES & TRAFFIC EXPORT ===\n";
csv += "File_Unique_ID,File_Name,File_Size,Owner_ID,Total_Downloads\n";

for (var j = 0; j < allFiles.length; j++) {
  var fId = allFiles[j];
  var fData = Bot.getProperty("file_" + fId, {});
  var traffic = Bot.getProperty("traffic_" + fId, { count: 0 });
  csv += fId + ',"' + (fData.file_name || "").replace(/"/g, '""') + '","' + (fData.file_size || "N/A") + '","' + (fData.owner_id || "N/A") + '",' + (traffic.count || 0) + '\n';
}

var keyb = [
  [{ text: "⬅️ Back to Admin Panel", callback_data: "/admin" }]
];

Api.sendMessage({
  text: "📑 *CSV Data Export*\n`———————————————————————`\n```csv\n" + csv.slice(0, 3800) + "\n```",
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});

