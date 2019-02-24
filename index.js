const Discord = require('discord.js');
const bot = new Discord.Client();

const discordCredentials = require('./credentials/discord.json');
const settings = require('./settings.json');

function permissionlookup(permission, msg) {
  if (settings.opusers.includes(msg.author.id)) return true;
  if (!msg.member.permissions.has([permission], true)) {
    msg.channel.send(`<@${msg.author.id}> You dont have permissions to do that! You need **${permission.toLowerCase()}**.`);
    return false;
  }
}

bot.on("ready", async() => {
  console.log(`Bot is ready. ${bot.user.username}`);
  console.log(await bot.generateInvite(["ADMINISTRATOR"]));
});

bot.on('message', msg => {
  let msgArray = msg.content.split(" ");
  let command = msgArray[0].substring(1);

  if(!msg.content.startsWith(settings.prefix)) return;

  switch (command.toLowerCase()) {
    case "id":
    let user = msg.mentions.users.first();
    if (!user) user = msg.author;
    let embed = new Discord.RichEmbed()
    .setAuthor(user.username)
    .setColor("#42f49b")
    .addField("ID: ", user.id)
    .addField("Name: ", user.username)
    .addField("Bot: ", user.bot)
    .addField("Created at: ", user.createdAt)
    .addField("Avatar URL: ", user.avatarURL);
    msg.channel.send(embed);
    break;

    case "purge":
    if (permissionlookup("MANAGE_MESSAGES", msg) == false) return;
    if (isNaN(msgArray[1])) {
      msg.channel.send("That is not a valid number.");
      return;
    }
    if (msgArray[1] > 100) {
      msg.channel.send("You can only delete 100 msgs at once.");
    }
    msg.channel.bulkDelete(msgArray[1])
    .then(msgs => console.log(`Bulk deleted ${msgs.size} msgs by ${msg.author.username}`))
    .catch(console.error);
    msg.channel.send(`Removed ${msgArray[1]} messages by <@${msg.author.id}>`);
    break;

    default:
    msg.channel.send("I dont know this command")
    break;
  }
});

bot.login(discordCredentials.token);
