//Init packages
const Discord = require("discord.js");

//Credentials
const discordCredentials = require("./credentials/discord.json");

const settings = require('./settings.json');

const bot = new Discord.Client();

//Discord Permissions
function permissionlookup(permission, message) {
  if (settings.opusers.includes(message.author.id)) return true;
  if (!message.member.permissions.has([permission], true)) {
    message.channel.send(`<@${message.author.id}> You dont have permissions to do that! You need **${permission.toLowerCase()}**.`);
    return false;
  }
}

bot.on("ready", async() => {
  report.log(`Bot is ready. ${bot.user.username}`);
  report.log(await bot.generateInvite(["ADMINISTRATOR"]));
});

bot.on("error", async(error) => {
  report.error(error);
});

bot.on("message", async(message) => {
  if (message.content.startsWith(settings.prefix)) {

    let messageArray = message.content.split(" ");
    let command = messageArray[0];

    command = command.substring(1);

    switch (command.toLowerCase()) {
      case "help":
      message.channel.send(settings.help);
      break;

      default:
      message.channel.send(settings.default);
      break;
    }
  }
});

bot.login(discordCredentials.token);
