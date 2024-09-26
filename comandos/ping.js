import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

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

  const serverChecker = new ButtonBuilder()
  .setLabel("Servidor do Bot")
  .setEmoji("💻")
  .setCustomId("botServerCheck")
  .setStyle(ButtonStyle.Secondary)

  const buttonDisplayer = new ActionRowBuilder().addComponents(serverChecker);

  await interaction.editReply({embeds: [pingEmbed], components: [buttonDisplayer]});
}

export { comandoPingExecutar };