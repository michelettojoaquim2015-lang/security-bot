require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
});

const TOKEN = process.env.TOKEN;

const PALAVROES = [
  'puta', 'viado', 'buceta', 'porra', 'caralho',
  'merda', 'fdp', 'filho da puta', 'cuzao', 'vagabunda',
  'desgraça', 'arrombado', 'sua mae', 'otario', 'babaca'
];

const DOMINIOS_18 = [
  'onlyfans.com', 'pornhub.com', 'xvideos.com', 'xnxx.com',
  'xhamster.com', 'redtube.com', 'youporn.com', 'nhentai.net',
  'hentaihaven.xxx', 'hanime.tv', 'hentai2read.com', 'fakku.net',
  'hentai-foundry.com', 'rule34.xxx', 'gelbooru.com', 'danbooru.donmai.us'
];

const AVISOS = new Map();

function contaDias(user) {
  return Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));
}

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
  client.user.setActivity('🛡️ Protegendo o server', { type: 3 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const conteudo = message.content.toLowerCase();

  // 1. Filtro de palavrões
  const temPalavrão = PALAVROES.some(p => conteudo.includes(p));
  if (temPalavrão) {
    await message.delete().catch(() => {});
    const aviso = (AVISOS.get(message.author.id) || 0) + 1;
    AVISOS.set(message.author.id, aviso);

    if (aviso >= 3) {
      await message.guild.members.kick(message.author.id, 'Múltiplos palavrões').catch(() => {});
      message.channel.send(`🚫 <@${message.author.id}> foi kickado por uso repetido de palavrões.`);
      AVISOS.delete(message.author.id);
    } else {
      message.channel.send(`⚠️ <@${message.author.id}> linguagem inapropriada! Aviso ${aviso}/3`);
    }
    return;
  }

  // 2. Filtro +18 e hentai
  const temLink18 = DOMINIOS_18.some(d => conteudo.includes(d));
  if (temLink18) {
    await message.delete().catch(() => {});
    const aviso = (AVISOS.get(message.author.id) || 0) + 1;
    AVISOS.set(message.author.id, aviso);

    if (aviso >= 3) {
      await message.guild.members.kick(message.author.id, 'Envio repetido de conteúdo +18').catch(() => {});
      message.channel.send(`🚫 <@${message.author.id}> foi kickado por envio repetido de conteúdo +18.`);
      AVISOS.delete(message.author.id);
    } else {
      message.channel.send(`🔞 <@${message.author.id}> conteúdo +18 não permitido! Aviso ${aviso}/3`);
    }
    return;
  }
});

// Proteção contra contas novas
client.on('guildMemberAdd', async (member) => {
  const dias = contaDias(member.user);

  if (dias < 7) {
    await member.kick('Conta muito nova (menos de 7 dias)').catch(() => {});
    console.log(`🚫 ${member.user.tag} kickado — conta com ${dias} dias`);
    return;
  }

  if (!member.user.avatar) {
    console.log(`⚠️ Suspeito sem avatar: ${member.user.tag}`);
  }
});

client.login(TOKEN);