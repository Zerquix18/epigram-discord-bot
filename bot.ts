import * as fs from 'fs';
import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const epigramFile = fs.readFileSync('./epigrams.json');
const epigrams = JSON.parse(epigramFile.toString()) as string[];

console.log('Bot starting up...');

const bot = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});

bot.on('ready', () => {
  console.log(`Bot successfully connected as ${bot.user ? bot.user.tag : ''}`);
});

bot.on('messageCreate', (message) => {
  if (message.content.startsWith('/epigram')) {
    message.channel.send(epigrams[Math.floor(Math.random() * epigrams.length)]);
  }
});

function sendOutRandomEpigram() {
  const date = new Date();
  if (date.getHours() !== 10) { // 9AM
    return;
  }

  bot.channels.cache.forEach((channel) => {
    if (channel.type === 'GUILD_TEXT') {
      (channel as Discord.TextChannel).send(epigrams[Math.floor(Math.random() * epigrams.length)]);
    }
  });
}

console.log(process.env.EPIGRAM_BOT_TOKEN);

bot.login(process.env.EPIGRAM_BOT_TOKEN);
setInterval(sendOutRandomEpigram, 3600000); // every hr 
