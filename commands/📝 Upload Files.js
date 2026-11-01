/*CMD
  command: 📝 Upload Files
  help: 
  need_reply: true
  auto_retry_time: 
  folder: 
  answer: 📤 *Send the file you want to upload in the bot:*

  keyboard: 
  aliases: 
  group: 
CMD*/

if (!request.document) {
  Bot.sendMessage("⚠️ *Please send a valid file/document!*", { parse_mode: "Markdown" });
  return;
}

var doc = request.document;
doc.owner_id = user.telegramid;
doc.owner_name = user.first_name || "User";
doc.owner_username = user.username || "";
doc.uploaded_at = new Date().toISOString();

// Store file properties
Bot.setProperty(user.telegramid + "" + doc.file_unique_id, doc, "json");
Bot.setProperty("file_" + doc.file_unique_id, doc, "json");

var keyb = [
  [
    {
      text: "📪 Upload To Server",
      callback_data: "/uploadDocument " + doc.file_unique_id
    }
  ]
];

Api.sendMessage({
  text:
    "*🗂 File Info*\n`———————————————————————`\n📦 *File Name :* " +
    (doc.file_name || "Document") +
    "\n📊 *File Size :* " +
    (doc.file_size || "N/A") +
    "\n📁 *File Type :* " +
    (doc.mime_type || "document"),
  parse_mode: "Markdown",
  reply_markup: { inline_keyboard: keyb }
});
