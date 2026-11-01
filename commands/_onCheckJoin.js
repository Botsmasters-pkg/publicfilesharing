/*CMD
  command: /onCheckJoin
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

Bot.runCommand("/checkJoin" + (params ? (" " + params) : ""));
