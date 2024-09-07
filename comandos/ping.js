import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

async function comandoPingExecutar(interaction) {
  const start = Date.now();
  const end = Date.now();

  let pingEmbed = new EmbedBuilder({
    "title": `🏓Pong!`,
    "description": `Ping das nossas nets`,
    "color": 0xafd99c,
    "fields": [
      {
        "name": `Meu ping`,
        "value": `${end - start}ms`,
        "inline": true
      },
      {
        "name": `Teu ping`,
        "value": `${client.ws.service}ms`,
        "inline": true
      },
      {
        "name": `Servidor donde o bot está rodando`,
        value: "```Replit```"
      }
    ],
    "thumbnail": {
      "url": `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmNhpgl7Cs8EWjyZFZmnOrPA--DaxM3ctjCg&usqp=CAU`,
    },
    "footer": {
      "text": `E aí? Tá rápido ou lento?`
    },
    });
  
  await interaction.reply({ embeds: [pingEmbed], ephemeral: false });
}

export { comandoPingExecutar };