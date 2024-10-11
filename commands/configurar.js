import { RoleSelectMenuBuilder, ActionRowBuilder, ComponentType } from 'discord.js';
import fs from 'fs';
import path from 'path';

async function comandoConfigurarExecutar(interaction, options) {
    await interaction.deferReply({ ephemeral: true });
    
    const subcommandGroup = options.getSubcommandGroup();
    const subcommand = options.getSubcommand();

    const dataAutoroles = path.resolve('data', 'interactions', 'autorole', 'autoroles.json');

    let autoroleData = {};
    if (fs.existsSync(dataAutoroles)) {
        const fileContent = fs.readFileSync(dataAutoroles, 'utf-8');
        autoroleData = JSON.parse(fileContent);
    }

    if (subcommandGroup === "cargo" && subcommand === "automático") {
        const roleSel = new RoleSelectMenuBuilder()
        .setCustomId(`autorole-${interaction.id}`)
        .setPlaceholder('Selecione um cargo!')
        .setMinValues(1).setMaxValues(1);

        const roleSelDisplay = new ActionRowBuilder().addComponents(roleSel);

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
    }
}

export { comandoConfigurarExecutar };