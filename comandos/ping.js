import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

async function comandoPingExecutar(interaction) {
  await interaction.deferReply();

  const sentMessage = await interaction.fetchReply();
  const sentTimestamp = sentMessage.createdTimestamp;

  const currentTimestamp = Date.now();

  const ping = currentTimestamp - sentTimestamp;

  let pingEmbed = new EmbedBuilder({
    "title": `🏓Pong!`,
    "description": `Meu ping (minha latência): ${ping}ms`,
    "color": 0xafd99c,
    "thumbnail": {
      "url": `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmNhpgl7Cs8EWjyZFZmnOrPA--DaxM3ctjCg&usqp=CAU`,
    },
    "footer": {
      "text": `E aí? Tá rápido ou lento?`
    },
  });

  await interaction.editReply({embeds: [pingEmbed]});
}

export { comandoPingExecutar };