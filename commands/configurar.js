import { RoleSelectMenuBuilder, ActionRowBuilder, ComponentType, PermissionsBitField, ButtonBuilder, ButtonStyle } from 'discord.js';
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
    } else if (!subcommandGroup && subcommand === "servidor") {
        const channels = interaction.guild.channels.cache;

        const buttonYes = new ButtonBuilder()
        .setCustomId(`basic-channels-yes-${interaction.id}`)
        .setLabel('Sim')
        .setEmoji('📫')
        .setStyle(ButtonStyle.Success);

        const buttonNo = new ButtonBuilder()
        .setCustomId(`basic-channels-no-${interaction.id}`)
        .setLabel('Não')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Success);

        const basicChannelsRow = new ActionRowBuilder().addComponents(buttonYes, buttonNo);

        if (channels.size && channels.size > 2) {
            const buttonProceed = new ButtonBuilder()
            .setCustomId(`proceed-button-${interaction.id}`)
            .setLabel('Sim')
            .setEmoji('👍')
            .setStyle(ButtonStyle.Success);

            const buttonForgetIt = new ButtonBuilder()
            .setCustomId(`stop-button-${interaction.id}`)
            .setLabel('Esquece!!! Não quero perder nada :(')
            .setEmoji('🧨')
            .setStyle(ButtonStyle.Danger);

            const row1 = new ActionRowBuilder().addComponents(buttonProceed, buttonForgetIt);

            const reply = await interaction.editReply({
                content: `⚠️ **|** Parece que você já fez alguns canais neste servidor. Ao continuar com esta operação, você concorda que, _talvez_, alguns de seus canais existentes sejam deletados. Quer prosseguir?`,
                components: [row1]
            });

            reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (i) => i.user.id === interaction.user.id && i.customId === `proceed-button-${interaction.id}` || i.customId === `stop-button-${interaction.id}`,
                time: 60000
            });

            collector.on('collect', async (collectedInteraction) => {
                if (collectedInteraction.customId === `proceed-button-${interaction.id}`) {
                    await interaction.editReply({
                        content: `📝 **|** Você deseja criar canais básicos?`,
                        components: [basicChannelsRow]
                    });
                } else {
                    await interaction.editReply({ content: `🛑 **|** Operação cancelada.`, components: []});
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.editReply({ 
                        content: '⏳ **|** Tempo esgotado! Nenhum botão foi selecionado.', 
                        components: []
                    });
                }
            });
        }
    }
}

export { comandoConfigurarExecutar };