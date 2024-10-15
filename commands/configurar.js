import { RoleSelectMenuBuilder, ActionRowBuilder, ComponentType, PermissionsBitField, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import fs from 'fs';
import path from 'path';

async function comandoConfigurarExecutar(interaction, options) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    
    const subcommandGroup = options.getSubcommandGroup();
    const subcommand = options.getSubcommand();

    const dataAutoroles = path.resolve('data', 'interactions', 'autorole', 'autoroles.json');

    const hasPermission = (permission) => {
        return member.permissions.has(PermissionsBitField.Flags[permission]);
    };

    let autoroleData = {};
    if (fs.existsSync(dataAutoroles)) {
        const fileContent = fs.readFileSync(dataAutoroles, 'utf-8');
        autoroleData = JSON.parse(fileContent);
    }

    if (subcommandGroup === "cargo" && subcommand === "automático") {
        if (!hasPermission('ManageRoles')) {
            await interaction.editReply('❎ **|** Você não tem permissão pra fazer isso! Volte quando puder `Gerenciar Cargos`, OK?');
            return;
        }
        const roleSel = new RoleSelectMenuBuilder()
        .setCustomId(`autorole-${interaction.id}`)
        .setPlaceholder('Selecione um cargo!')
        .setMinValues(1).setMaxValues(1);

        const roleSelDisplay = new ActionRowBuilder().addComponents(roleSel);

        if (autoroleData[interaction.guild.id]) {
            const overrideReply = await interaction.editReply({
                content: '❓ **|** Ei! Esse servidor já tem um cargo automático configurado! Selecionar um cargo abaixo vai substituir o cargo atual.',
                components: [roleSelDisplay],
                ephemeral: true
            });

            const collector = overrideReply.createMessageComponentCollector({
                componentType: ComponentType.RoleSelect,
                filter: (i) => i.user.id === interaction.user.id && i.customId === `autorole-${interaction.id}`,
                time: 60000
            });

            collector.on('collect', async (collectedInteraction) => {
                const selectedRole = collectedInteraction.values[0];
        
                autoroleData[interaction.guild.id] = selectedRole;
        
                fs.writeFileSync(dataAutoroles, JSON.stringify(autoroleData, null, 2), 'utf-8');
        
                await collectedInteraction.update({ 
                    content: `✅ **|** O cargo automático foi substituído para: <@&${selectedRole}>`, 
                    components: [],
                    ephemeral: true
                });
            });
        
            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.editReply({ 
                        content: '⏳ **|** Tempo esgotado! Nenhum cargo foi selecionado.', 
                        components: [], 
                        ephemeral: true 
                    });
                }
            });

            return;
          }

        const reply = await interaction.editReply({ 
            content: '👌 **|** OK!\n\n📦 **|** Selecione qual cargo você quer que seja o cargo automático abaixo!', 
            components: [roleSelDisplay], 
            ephemeral: true 
        });

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.RoleSelect,
            filter: (i) => i.user.id === interaction.user.id && i.customId === `autorole-${interaction.id}`,
            time: 60000
        });

        collector.on('collect', async (collectedInteraction) => {
            const selectedRole = collectedInteraction.values[0];

            autoroleData[interaction.guild.id] = selectedRole;

            fs.writeFileSync(dataAutoroles, JSON.stringify(autoroleData, null, 2), 'utf-8');

            await collectedInteraction.update({ 
                content: `✅ **|** O cargo automático foi configurado para: <@&${selectedRole}>`, 
                components: [],
                ephemeral: true
            });
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                await interaction.editReply({ 
                    content: '⏳ **|** Tempo esgotado! Nenhum cargo foi selecionado.', 
                    components: [], 
                    ephemeral: true 
                });
            }
        });
    } else if (subcommand === "servidor") {
        const hasManageChannelsPerm = hasPermission('ManageChannels');
        if (!hasManageChannelsPerm) {
            await interaction.editReply('❌ **|** Você precisa da permissão `Gerenciar Canais` para configurar o servidor!');
            return;
        }

        const existingCategory = interaction.guild.channels.cache.find(
            (c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('info')
        );

        if (existingCategory) {
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_recreate')
                .setLabel('Confirmar')
                .setStyle(ButtonStyle.Success);
            
            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_recreate')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger);

            const buttonRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            await interaction.editReply({
                content: '❓ **|** Uma categoria contendo "Info" já existe. Deseja recriar as regras e anúncios?',
                components: [buttonRow]
            });

            const collector = interaction.channel.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 15000,
                filter: (btnInt) => btnInt.user.id === interaction.user.id
            });

            collector.on('collect', async (buttonInteraction) => {
                if (buttonInteraction.customId === 'confirm_recreate') {
                    const channelsToDelete = existingCategory.children;

                    for (const channel of channelsToDelete.values()) {
                        await channel.delete('Removendo canal antes de recriar a categoria "Info"');
                    }
                    
                    await existingCategory.delete('Recriando a categoria "Info"');

                    const infoCategory = await interaction.guild.channels.create({
                        name: 'Info',
                        type: ChannelType.GuildCategory,
                        reason: 'Categoria de Informações recriada pelo Freeless Bot'
                    });

                    const rulesChannel = await interaction.guild.channels.create({
                        name: 'regras',
                        type: ChannelType.GuildText,
                        parent: infoCategory.id,
                        reason: 'Canal de Regras recriado pelo Freeless Bot',
                        topic: 'Regras do servidor'
                    });

                    const announcementsChannel = await interaction.guild.channels.create({
                        name: 'anúncios',
                        type: ChannelType.GuildText,
                        parent: infoCategory.id,
                        reason: 'Canal de Anúncios recriado pelo Freeless Bot',
                        topic: 'Anúncios importantes do servidor'
                    });

                    await buttonInteraction.update({
                        content: `✅ **|** A categoria "Info" foi recriada com os canais ${rulesChannel} e ${announcementsChannel}!`,
                        components: []
                    });
                } else if (buttonInteraction.customId === 'cancel_recreate') {
                    await buttonInteraction.update({
                        content: '❌ **|** A recriação da categoria "Info" foi cancelada!',
                        components: []
                    });
                }
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'time') {
                    await interaction.editReply({
                        content: '⏳ **|** Tempo esgotado! Nenhuma ação foi realizada.',
                        components: []
                    });
                }
            });
        } else {
            const infoCategory = await interaction.guild.channels.create({
                name: 'Info',
                type: ChannelType.GuildCategory,
                reason: 'Categoria de Informações criada pelo Freeless Bot'
            });

            const rulesChannel = await interaction.guild.channels.create({
                name: 'regras',
                type: ChannelType.GuildText,
                parent: infoCategory.id,
                reason: 'Canal de Regras criado pelo Freeless Bot',
                topic: 'Regras do servidor'
            });

            const announcementsChannel = await interaction.guild.channels.create({
                name: 'anúncios',
                type: ChannelType.GuildText,
                parent: infoCategory.id,
                reason: 'Canal de Anúncios criado pelo Freeless Bot',
                topic: 'Anúncios importantes do servidor'
            });

            await interaction.editReply(`✅ **|** Categoria "Info" criada com os canais ${rulesChannel} e ${announcementsChannel}!`);
        }
    }
}

export { comandoConfigurarExecutar };