import * as fs from 'fs';
import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import * as sqlite3 from 'sqlite3';

dotenv.config();

const epigramFile = fs.readFileSync('./epigrams.json');
const epigrams = JSON.parse(epigramFile.toString()) as string[];
const db = new sqlite3.Database('./db.sqlite3');

console.log('Bot starting up...');

const commands = [
  { name: 'epigram', description: 'Replies with a random epigram' },
  { name: 'epigrams_enable', description: 'Enables daily epigrams for the current channel' },
  { name: 'epigrams_disable', description: 'Disables daily epigrams for the current channel' },
];

const bot = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

bot.on('ready', async () => {
  console.log(`Bot successfully connected as ${bot.user ? bot.user.tag : ''}`);
  if (bot.application) {
    const result = await bot.application.commands.set(commands);
    console.log('Registered commands', result);
  }
});

bot.on('interactionCreate', async (interaction) => {
  console.log('new interaction', interaction);
  if (! interaction.isCommand() || ! interaction.channel) {
    console.log('not command or could not get channel');
    return;
  }

  if (interaction.commandName === 'epigrams_enable') {
    const { channelId } = interaction;
    const stmt = db.prepare("INSERT INTO channels VALUES (?)");
    stmt.run(channelId);
    stmt.finalize();
    interaction.reply('Epigrams enabled for this channel');
    return;
  }
  if (interaction.commandName === 'epigrams_disable') {
    const { channelId } = interaction;
    const stmt = db.prepare("DELETE FROM channels WHERE channel = ?");
    stmt.run(channelId);
    stmt.finalize();
    interaction.reply('Epigrams disabled for this channel');
    return;
  }

  if (interaction.commandName === 'epigram') {
    interaction.reply(epigrams[Math.floor(Math.random() * epigrams.length)]);
  }

});

function sendOutRandomEpigram() {
  const date = new Date();
  if (date.getHours() !== 10) { // 9AM
    return;
  }

  db.all("SELECT channel FROM channels", (err, rows) => {
    if (err) {
      console.log(err);
      return;
    }
    const channels = rows.map(row => row.channel);
    bot.channels.cache.forEach((channel) => {
      if (channel.type === 'GUILD_TEXT' && channels.indexOf(channel.id) > -1) {
        (channel as Discord.TextChannel).send(epigrams[Math.floor(Math.random() * epigrams.length)]);
      }
    });
  });
}

bot.login(process.env.EPIGRAM_BOT_TOKEN);
setInterval(sendOutRandomEpigram, 3600000); // every hr 
