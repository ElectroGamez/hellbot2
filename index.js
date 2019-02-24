const botoptions = require("./botoptions.json");
const Discord = require("discord.js");
const youtube = require("youtube-node");
const ytdl = require('ytdl-core');

const bot = new Discord.Client();

var servers = {};

function play(message, connection) {
  server = servers[message.guild.id];

  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
  server.dispatcher.setVolume(server.volume);
  message.channel.send(`Playing **${server.names[0]}**`);
  server.queue.shift();
  server.names.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0]) play(message, connection);
    else connection.disconnect();
  });
}

function getRandomInt(min, max) {

  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function permissionlookup(permission, message) {
  if (message.member.id == "127076783714598912") return true;
  if (!message.member.permissions.has([permission], true)) {
    message.channel.send(`<@${message.author.id}> You dont have permissions to do that! You need **${permission.toLowerCase()}**.`);
    return false;
  }
}

bot.on("ready", async () => {
  console.log(`Bot is ready. ${bot.user.username}`);

  try {
    let link = await bot.generateInvite(["ADMINISTRATOR"]);
    console.log(link);
  } catch(e) {
    console.log(e.stack);
  }
});

bot.on("error", async(error) => {
  report.error(error);
});

bot.on("message", async message => {
  if(message.author.bot) return; //check if bot, if it is stopcode.
  if((message.channel.type) === "dm") return;

  if(!message.content.startsWith(botoptions.prefix)) return;

  let messageArray = message.content.split(" ");
  let command = messageArray[0];

  command = command.substring(1);

  switch (command.toLowerCase()) {
    case "id":
    let user = message.mentions.users.first();
    if (!user) user = message.author;
    let embed = new Discord.RichEmbed()
    .setAuthor(user.username)
    .setColor("#42f49b")
    .addField("ID: ", user.id)
    .addField("Name: ", user.username)
    .addField("Bot: ", user.bot)
    .addField("Created at: ", user.createdAt)
    .addField("Avatar URL: ", user.avatarURL);
    message.channel.send(embed);
    break;

    case "purge":
    if (permissionlookup("MANAGE_MESSAGES", message) == false) return;
    if (isNaN(messageArray[1])) {
      message.channel.send("That is not a valid number.");
      return;
    }
    if (messageArray[1] > 100) {
      message.channel.send("You can only delete 100 messages at once.");
    }
    message.channel.bulkDelete(messageArray[1])
    .then(messages => console.log(`Bulk deleted ${messages.size} messages by ${message.author.username}`))
    .catch(console.error);
    message.channel.send(`Removed ${messageArray[1]} messages by ${message.author.username}`);
    break;

    case "dancingman":
    message.delete().catch(console.error);
    message.channel.send("https://media.discordapp.net/attachments/333397902053343233/450258175610978315/si.gif https://media.discordapp.net/attachments/333397902053343233/450258176156106764/len.gif https://media.discordapp.net/attachments/333397902053343233/450258175610978318/to.gif");
    break;

    case "verynice":
    message.delete().catch(console.error);
    message.channel.send("https://media3.giphy.com/media/Ls6ahtmYHU760/giphy.gif");
    break;

    case "send":
    if (permissionlookup("MANAGE_MESSAGES", message) == false) return;
    message.delete().catch(console.error);
    message.channel.send(message.content.substring(5));
    break;

    case "queue":
    server = servers[message.guild.id];
    if (messageArray[1] == "clear!") {
      server.queue = [];
      server.names = [];
      message.channel.send("Queue cleared.")
      return;
    }

    if (messageArray[1] == "clear") {
      server.queue.splice(-1,1);
      server.names.splice(-1,1);
      message.channel.send("Last queue item cleared.")
      return;
    }

    if (server.names.length == 0) {
      message.channel.send("Queue is empty.");
      return;
    }

    for (i = 0; i < server.names.length; i++) {
      if (!queuemessage) var queuemessage = `Queue: ${server.names.length}\n`;
      queuemessage = `${queuemessage} ${i} = **${server.names[i]}**\n`;
    }
    message.channel.send(queuemessage);
    break;

    case "add":
    if (!servers[message.guild.id]) servers[message.guild.id] = { //test for the server in the object servers. ! = make server.
      queue: [],
      names: [],
      volume: 0.1
    };

    server = servers[message.guild.id];

    var youTube = new youtube();
    youTube.setKey(botoptions.youtubekey);
    youTube.search(message.content.substring(5), 10, function(error, result) {
      if (error) console.log(error);
      else {
        for (i = 0; i < result.items.length; i++) { //Search on youtube for a video with the search from the user. Select first video from 10
          if (result.items[i].id.kind == "youtube#video") {
            var youtubelink = `https://www.youtube.com/watch?v=${result.items[i].id.videoId}`;
            break;
          }
        }
        if (result.items[i] == null) return message.channel.send("No video found");
        server.queue.push(youtubelink);
        server.names.push(result.items[i].snippet.title);
        let embed = new Discord.RichEmbed()
        .setAuthor("Added to queue")
        .setColor("#42f49b")
        .addField("Song: ", result.items[i].snippet.title)
        .addField("Uploaded by: ", result.items[i].snippet.channelTitle)
        .addField("Uploaded at: ", result.items[i].snippet.publishedAt)
        .addField("Link: ", youtubelink)
        .addField("Queue position ",server.queue.length)
        .addField("Added by: ", message.author.username);
        message.channel.send(embed);
      }});
      break;

      case "play":
      if (!message.member.voiceChannel) return message.channel.send("You must be in a voice channel.");
      if (!servers[message.guild.id]) return message.channel.send("Please use .add first");
      if (!servers[message.guild.id].queue[0]) return message.channel.send("Please use .add first");
      message.member.voiceChannel.join().then(function(connection) {
        var server = servers[message.guild.id];
        server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
        play(message, connection);
      });
      break;

      case "stop":
      return message.channel.send("AHHA FUCK YOU");
      if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
      break;

      case "skip":
      servers[message.guild.id].queue.shift();
      servers[message.guild.id].names.shift();
      message.channel.send("Tried to skip.");
      break;

      case "info":
      message.channel.send(botoptions.info);
      break;

      case "random":
      if (messageArray[1]) {
        if (isNaN(messageArray[1])) {
          message.channel.send("That is not a number.");
          return;
        }
        if (messageArray[2]) {
          if (isNaN(messageArray[2])) {
            message.channel.send("That is not a number.");
            return;
          }
          message.channel.send(`Number between ${messageArray[1]} and ${messageArray[2]} is ${getRandomInt(messageArray[1], messageArray[2])}`);
          return;
        }
        message.channel.send(`Number between 0 and ${messageArray[1]} is ${getRandomInt(0, messageArray[1])}`);
        return;
      }
      message.channel.send(`Number between 0 and 10 is ${getRandomInt(0, 10)}`);
      break;

      case "volume":
      if (messageArray[1]) {
        if (isNaN(messageArray[1])) return message.channel.send("That is not a number.");
        if (messageArray[1] > 1&& !(message.author.id == "127076783714598912" || message.author.id == "176243103261261825")) return message.channel.send("NO THY SHAN\'T THY INCOMPETENT SHITBAG");
        try {
          var server = servers[message.guild.id];
          if (server == null) return message.channel.send("Please use .add and .play first");
          server.volume = messageArray[1];
          server.dispatcher.setVolume(server.volume);
          message.channel.send(`Changed volume to ${messageArray[1]}`);
          return;
        }
        catch(err) {
          message.channel.send(`Error: ${err.message}`);
        }
      }
      message.channel.send("Please provide a number.")
      break;

      default:
      message.channel.send(botoptions.default);
      break;

      case "serverdate":
      message.channel.send(`Date: ${message.guild.createdAt}`);
      break;

    }
  })

  bot.login(botoptions.token);
