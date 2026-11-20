/*CMD
  command: /deleteBatch
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

var batchId = params.trim();
var userBatches = Bot.getProperty("userBatches_" + user.telegramid, []);
var filtered = [];

for (var i = 0; i < userBatches.length; i++) {
  if (userBatches[i].batchId !== batchId) {
    filtered.push(userBatches[i]);
  }
}

try {
  Bot.setProperty("userBatches_" + user.telegramid, filtered, "json");
  Bot.setProperty("batch_" + batchId, null);
} catch (e) {}

Bot.runCommand("/mybatches");
