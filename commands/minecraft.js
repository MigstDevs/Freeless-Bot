import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { lookupName } from 'namemc';

async function getPlayerUuid(playerName) {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${playerName}`);
    const data = await response.json();
    if (data.id) return data.id
    else return null;
}

async function comandoMinecraftExecutar(interaction, options) {
  const subcommand = options.getSubcommand();

  if (subcommand === 'status') {
    const ip = options.getString('ip');

      try {
        const response = await fetch(`https://mcapi.us/server/status?ip=${encodeURIComponent(ip)}`);
        const data = await response.json();
        let isOnline = 'Não';
        let convertedTime = new Date(data.last_updated * 1000);
        let day = convertedTime.getDate();
        let month = convertedTime.getMonth() + 1;
        let year = convertedTime.getFullYear();

        let formattedDate = `${day}/${month}/${year}`;

        if (data.online === true) {
          isOnline = 'Sim';
        }

        if (data.online) {
          const embed = new EmbedBuilder({
            title: `Status do Servidor ${ip}`,
            color: 0xe1bbdc,
            fields: [
              { name: '⚡Online', value: `${isOnline}`, inline: true },
              { name: '👥 Jogadores Atuais', value: `${data.players.now}`, inline: true },
              { name: '👥 Jogadores Máximos', value: `${data.players.max}`, inline: true },
              { name: '✍️ Versão do Servidor', value: `${data.server.name}`, inline: true },
              { name: '🕰️ Última vez atualizado na API', value: formattedDate, inline: true },
              { name: '📝M.O.T.D', value: `${data.motd}`, inline: true },
            ],
            footer: {
              text: `Executado por ${interaction.member.displayName}`,
              icon_url: interaction.member.displayAvatarURL(),
            },
          });

          interaction.reply({ embeds: [embed], ephemeral: false });
        } else if (data.status === "error") {
          const issueEmbed = new EmbedBuilder({
            title: `Erro`,
            color: 0xff0000,
            fields: [
              { name: '⚡Online', value: `${isOnline}`, inline: true },
              { name: '❌ Erro:', value: 'Servidor Offline / IP Inválido!' },
            ],
          });

          await interaction.reply({
            embeds: [issueEmbed],
            ephemeral: true,
          });
        }
      } catch (error) {
        await interaction.reply({
          content: 'Ocorreu um erro ao obter informações do servidor.',
          ephemeral: true,
        });
        console.error(error);
      }
  } else if (subcommand === 'jogador') {
    const playerName = options.getString('jogador');

    const uuid = await getPlayerUuid(playerName);

    const nameHistory = "Recurso indisponível no momento";

    const embed = new EmbedBuilder({
      title: `Dados do Jogador ${playerName}`,
      color: 0xe1bbdc,
      fields: [
        {
          name: `UUID`,
          value: `**${uuid}**`,
        },
        {
          name: `Histórico de Nomes`,
          value: nameHistory,
        },
      ],
      thumbnail: { url: `https://crafatar.com/avatars/${uuid}?size=128&overlay`},
      footer: {
        text: `Executado por ${interaction.member.displayName}`,
        icon_url: interaction.member.displayAvatarURL(),
      },
    });

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
}

export { comandoMinecraftExecutar };