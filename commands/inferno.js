import { PermissionsBitField } from 'discord.js';

async function comandoInfernoExecutar(interaction, options) {
    await interaction.deferReply();

    const msg = options.getString('mensagem');
    const subcommand = options.getSubcommand();

    if (subcommand === "spam") {
        let messageCount = 0;
        const maxMessages = 100;

        await interaction.editReply(msg);
        messageCount = 1;

        const intervalId = setInterval(async () => {
            const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);
            if (!botPermissions || !botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
                clearInterval(intervalId);
                return;
            }

            try {
                if (messageCount >= maxMessages) {
                    clearInterval(intervalId);
                    return;
                }

                await interaction.channel.send(msg);
                messageCount++;
            } catch (error) {
                if (error.code === 50013) {
                    clearInterval(intervalId);
                } else {
                    console.error(error);
                }
            }
        }, 500);
    }
}

export { comandoInfernoExecutar };