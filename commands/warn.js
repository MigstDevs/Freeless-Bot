import { EmbedBuilder, PermissionsBitField } from "discord.js";

async function comandoWarnExecutar(interaction, options) {
    await interaction.deferReply({ ephemeral: true });
    const userToWarn = options.getUser("usuário");
    const warnReason = options.getString("motivo") || "😿 | Motivo não especificado";

    const hasTimeoutPermission = interaction.member.permissions.has(PermissionsBitField.Flags.TimeoutMembers);

    if (!hasTimeoutPermission) {
        await interaction.editReply({
            content: '❌ **|** Você não tem permissão para avisar membros! Você precisa da permissão `Timeout de Membros`.',
            ephemeral: true
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('**Você foi avisado!**')
        .setDescription(`Olá, ${userToWarn}! Você foi avisado em ${interaction.guild.name}, e esse aviso foi enviado por ${interaction.user}! Tome mais cuidado da próxima vez, está bem?\n\n_Motivo:_ \`📝 | ${warnReason}\``)
        .setColor("Blue")
        .setFooter({
            text: 'Aviso por Freeless Bot',
            iconURL: 'https://img.freepik.com/vetores-premium/sinais-de-aviso-placa-de-aviso-antigo-sinal-de-perigo-icone-de-aviso_526569-696.jpg'
        })
        .setImage(interaction.guild.iconURL({ dynamic: true, size: 1024 }));

    if (warnReason === "😿 | Motivo não especificado") {
        embed.setDescription(`Olá, ${userToWarn}! Você foi avisado em ${interaction.guild.name}, e esse aviso foi enviado por ${interaction.user}! Tome mais cuidado da próxima vez, está bem?\n\n_Motivo:_ \`${warnReason}\``)
    }

    await userToWarn.send({ embeds: [embed] }).catch(error => {
        console.error('Could not send warning DM to the user:', error);
    });

    await interaction.editReply({
        content: `✅ **|** O aviso foi enviado para ${userToWarn}!`,
        ephemeral: true
    });
}

export { comandoWarnExecutar };