import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType, PermissionsBitField } from 'discord.js';

async function comandoNukeExecutar(interaction, options) {
    await interaction.deferReply();

    const subcommand = options.getSubcommand();
    const guild = interaction.guild;
    const member = interaction.member;

    let sureEmbed = new EmbedBuilder({
        title: '⚠️ Ei! Calma lá!',
        description: 'A utilização deste comando resultará em TODAS as mensagens desse canal serem deletadas! Você tem certeza do que quer fazer?',
    });

    let yesButton = new ButtonBuilder()
        .setCustomId('yesButtonNuke')
        .setEmoji('💣')
        .setLabel('SIM!')
        .setStyle(ButtonStyle.Danger);

    let noButton = new ButtonBuilder()
        .setCustomId('noButtonNuke')
        .setEmoji('😑')
        .setLabel('Não.')
        .setStyle(ButtonStyle.Secondary);

    const buttonDisplayer = new ActionRowBuilder().addComponents(yesButton, noButton);

    const hasPermission = (permission) => {
        return member.permissions.has(PermissionsBitField.Flags[permission]);
    };
    
    if (subcommand === "local") {
        if (!hasPermission('Manage_Messages')) {
            return interaction.editReply({ content: '❌ **|** Você não tem permissão pra fazer isso!', ephemeral: true });
        }

        const replyMessage = await interaction.editReply({ embeds: [sureEmbed], components: [buttonDisplayer] });
        
        const collector = replyMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'noButtonNuke') {
                await i.reply({ content: '🛑 **|** Nuke cancelado.', ephemeral: true });
                await interaction.deleteReply();
                collector.stop();
            } else if (i.customId === 'yesButtonNuke') {
                const channel = interaction.channel;

                const channelProps = {
                    name: channel.name,
                    type: channel.type,
                    position: channel.position,
                    parent: channel.parentId,
                    permissionOverwrites: channel.permissionOverwrites.cache.map(permission => permission)
                };

                await channel.delete();

                const newChannel = await guild.channels.create({
                    name: channelProps.name,
                    type: channelProps.type,
                    position: channelProps.position,
                    parent: channelProps.parent,
                    permissionOverwrites: channelProps.permissionOverwrites
                });

                await newChannel.send(`💣 **|** Esse canal foi nukado por ${interaction.user}!`);
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply('⏳ **|** Tempo expirado. Nuke cancelado.');
            }
        });

    } else if (subcommand === "global") {
        const guildOwner = await guild.fetchOwner();
        if (guildOwner.id !== member.id && !hasPermission('Manage_Channels')) {
            return interaction.editReply({ content: '❌ **|** Você não tem permissão pra fazer isso!', ephemeral: true });
        }

        sureEmbed = new EmbedBuilder({
            title: '⚠️ Ei! Calma lá!',
            description: 'Você está prestes a DELETAR TODOS os canais e categorias deste servidor. Tem certeza do que está fazendo?'
        });

        const replyMessage = await interaction.editReply({ embeds: [sureEmbed], components: [buttonDisplayer] });

        const collector = replyMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'noButtonNuke') {
                await i.reply({ content: '🛑 **|** Nuke global cancelado.', ephemeral: true });
                await interaction.deleteReply();
                collector.stop();
            } else if (i.customId === 'yesButtonNuke') {
                const channels = guild.channels.cache;

                await Promise.all(channels.map(channel => channel.delete()));
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply('⏳ **|** Tempo expirado. Nuke global cancelado.');
            }
        });
    }
}

export { comandoNukeExecutar };