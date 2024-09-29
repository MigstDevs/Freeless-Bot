import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';
import { getExecuter } from '../commands/anime.js';

async function fightExpansion(interaction) {
    const interactionId = interaction.customId.split('-').pop();
    const commandExecuters = getExecuter();
    const executerUser = commandExecuters[interactionId];

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`fight-options-${interactionId}`)
        .setPlaceholder('Escolha seu próximo ataque')
        .addOptions([
            new StringSelectMenuOptionBuilder()
                .setLabel('Ataques Amaldiçoados')
                .setValue('ataques_amaldiçoados')
                .setEmoji('❤️‍🔥'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Esmagamento')
                .setValue('esmagamento')
                .setEmoji('🕳️'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Soco Divergente')
                .setValue('soco_divergente')
                .setEmoji('🤜'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Contra-ataque')
                .setValue('contra_ataque')
                .setEmoji('🛡️'),
        ]);

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    if (executerUser) {
        if (executerUser.id === interaction.user.id) {
            await interaction.reply({ content: `🤨 **|** O que você PENSA que está fazendo? Você não pode lutar com você mesmo!`});
            return;
        } else {
            await interaction.reply({ content: `🥊 **|** Eita! <@${interaction.user.id}> chamou <@${executerUser.id}> para lutar!`, components: [actionRow]});
        }
    } else {
        await interaction.reply({ content: "❌ **|** Não consegui encontrar o usuário que iniciou a expansão!", ephemeral: true});
    }
}

export { fightExpansion };