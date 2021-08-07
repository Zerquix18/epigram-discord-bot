import * as fs from 'fs';
import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';
import * as sqlite3 from 'sqlite3';

dotenv.config();

const epigramFile = fs.readFileSync('./epigrams.json');
const epigrams = JSON.parse(epigramFile.toString()) as string[];
const db = new sqlite3.Database('./db.sqlite3');

console.log('Bot starting up...');

const bot = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

bot.on('ready', () => {
  console.log(`Bot successfully connected as ${bot.user ? bot.user.tag : ''}`);
  if (bot.application) {
    bot.application.commands.create({
      name: 'epigram',
      description: 'Replies with a random epigram',
    });
    bot.application.commands.create({
      name: 'epigrams_enable',
      description: 'Enables daily epigrams for the current channel',
    });
    bot.application.commands.create({
      name: 'epigrams_disable',
      description: 'Disables daily epigrams for the current channel',
    });
  }
});

bot.on('messageCreate', (message) => {
  if (message.content.startsWith('/epigrams_enable')) {
    const { channelId } = message;
    const stmt = db.prepare("INSERT INTO channels VALUES (?)");
    stmt.run(channelId);
    stmt.finalize();
    message.channel.send('Epigrams enabled for this channel');
    return;
  }
  if (message.content.startsWith('/epigrams_disable')) {
    const { channelId } = message;
    const stmt = db.prepare("DELETE FROM channels WHERE channel = ?");
    stmt.run(channelId);
    stmt.finalize();
    message.channel.send('Epigrams disabled for this channel');
    return;
  }

  if (message.content === '/epigram') {
    message.channel.send(epigrams[Math.floor(Math.random() * epigrams.length)]);
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
