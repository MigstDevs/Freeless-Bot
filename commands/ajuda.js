import { EmbedBuilder } from 'discord.js';

async function comandoAjudaExecutar (interaction) {
  let helpMsg = new EmbedBuilder({
    "title": `**Ajuda**`,
    "description": `Meus comandos`,
    "color": 0x9ab8d1,
    "fields": [
      {
        "name": `Ping`,
        "value": `Calcula a velocidade de respota (ping) da minha internet. </ping:1172605561481736192>`,
        "inline": true,
      },
      {
        "name": `Convite`,
        "value": `Mostra o link para convidar o bot a um servidor </convite:1172857094634999808>`,
        "inline": true,
      },
      {
        "name": `Tocar`,
        "value": `Toca uma musiquinha 😎 </tocar:1174766259905245225>`,
        inline: true,
      },
      {
        name: `Minecraft`,
        value: `Vários subcomandos pra utilidades minecraftianas`,
        inline: true,
      },
    ],
    "thumbnail": {
      "url": `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn1eSLjAio08zQBzKCPTqa5fVEjgJCRhgHlg&usqp=CAU`,
    },
    "footer": {
      "text": `Freeless Bot - Beta; Executado por ${interaction.member.displayName}`,
      "icon_url": `https://iili.io/JoMAr0l.png`
    }
  });

  await interaction.reply({ embeds: [helpMsg] });
}

export { comandoAjudaExecutar };