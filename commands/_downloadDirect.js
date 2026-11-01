/*CMD
  command: /downloadDirect
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

if (!params) return;

var uniqueId = params.trim();
var file = Bot.getProperty("file_" + uniqueId);
if (!file) {
  var id = uniqueId.slice(0, 10);
  var fil = uniqueId.slice(10, 40);
  file = Bot.getProperty(id + "" + fil) || Bot.getProperty(uniqueId);
}

if (!file || !file.file_id) {
  Bot.sendMessage("⚠️ *File not found or link has expired.*", { parse_mode: "Markdown" });
  return;
}

// Log traffic for owner
var trafficKey = file.file_unique_id || uniqueId;
var traffic = Bot.getProperty("traffic_" + trafficKey, { count: 0, downloaders: [] });
traffic.count = (traffic.count || 0) + 1;
traffic.downloaders = traffic.downloaders || [];

var now = new Date().toISOString().slice(0, 19).replace("T", " ");
traffic.downloaders.push({
  id: user.telegramid,
  name: user.first_name || "User",
  username: user.username || "",
  date: now
});
Bot.setProperty("traffic_" + trafficKey, traffic, "json");

// Update total downloads stat
var totalDownloads = Bot.getProperty("totalDownloadsCount", 0) + 1;
Bot.setProperty("totalDownloadsCount", totalDownloads, "integer");

var caption = "*🗂 File Received!*\n`———————————————————————`\n📦 *File Name :* " + (file.file_name || "File") + "\n\n_Powered by @" + bot.name + "_";

if (file.file_type === "photo") {
  Api.sendPhoto({ chat_id: user.telegramid, photo: file.file_id, caption: caption, parse_mode: "Markdown" });
} else if (file.file_type === "video") {
  Api.sendVideo({ chat_id: user.telegramid, video: file.file_id, caption: caption, parse_mode: "Markdown" });
} else if (file.file_type === "audio") {
  Api.sendAudio({ chat_id: user.telegramid, audio: file.file_id, caption: caption, parse_mode: "Markdown" });
} else {
  Api.sendDocument({ chat_id: user.telegramid, document: file.file_id, caption: caption, parse_mode: "Markdown" });
}
