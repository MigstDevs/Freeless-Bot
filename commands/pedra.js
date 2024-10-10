import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

const rpsCHOICES = [
    { name: 'Pedra', emoji: '🪨', beats: 'Tesoura'},
    { name: 'Papel', emoji: '📄', beats: 'Pedra'},
    { name: 'Tesoura', emoji: '✂️', beats: 'Papel'},
];

async function comandoPedraExecutar(interaction, options) {
    try {
        const targetUser = options.getUser('oponente');

        if (interaction.user.id === targetUser.id) {
            await interaction.reply({ content: '😑 **|** Você não vai jogar pedra papel tesoura com você mesmo, né?', ephemeral: true});
            return;
        } else if (targetUser.id === "911646421441187931") {
            await interaction.reply('hmmmmmm');
            return;
        } else if (targetUser.bot && targetUser.id != "911646421441187931") {
            await interaction.reply({ content: '🤖 **|** Ei! Querendo jogar com outro bot! Que feio!', ephemeral: true});
            return;
        } else {
            const embed = new EmbedBuilder()
            .setTitle('Pedra Papel Tesoura!')
            .setColor('Yellow')
            .setDescription(`É a vez de ${targetUser}!`)
            .setTimestamp(new Date());

            const buttons = rpsCHOICES.map((choice) => {
                return new ButtonBuilder()
                .setCustomId(choice.name)
                .setLabel(choice.name)
                .setEmoji(choice.emoji)
                .setStyle(ButtonStyle.Secondary);
            });

            const buttonDisplay = new ActionRowBuilder().addComponents(buttons);

            const reply = await interaction.reply({ content: `🥊 **|** ${targetUser}, ${interaction.user} te chamou pra uma partida de pedra papel tesoura!\n\n🖱️ **|** Use os botões abaixo pra jogar!`, embeds: [embed], components: [buttonDisplay]})

            const targetUserInteraction = await reply.awaitMessageComponent({ filter: (i) => i.user.id === targetUser.id, time: 600000})
            .catch(async (error) => {
                embed.setDescription(`${targetUser} demorou demais! Jogo cancelado 😭`);
                await reply.edit({ embeds: [embed], components: []});
            });

            if (!targetUserInteraction) return;

            const targetUserChoice = rpsCHOICES.find(
                (choice) => choice.name === targetUserInteraction.customId,
            );

            await targetUserInteraction.reply({ content: `${targetUserChoice.emoji} **|** Você escolheu ${targetUserChoice.name}!\n👍 **|** Agora aguarde ${interaction.user} responder!`, ephemeral: true});

            embed.setDescription(`É a vez de ${interaction.user}!`);
            await reply.edit({ embeds: [embed], content: `🤝 **|** ${interaction.user}, pronto? É a sua vez agora!` });

            const initialUserInteraction = await reply.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 600000})
            .catch(async (error) => {
                embed.setDescription(`${interaction.user} demorou demais! Jogo cancelado 😭`);
                await reply.edit({ embeds: [embed], components: []});
            });

            if (!initialUserInteraction) return;

            const initialUserChoice = rpsCHOICES.find(
                (choice) => choice.name === initialUserInteraction.customId,
            );

            let result;

            if (targetUserChoice.beats === initialUserChoice.name) result = `${targetUser} ganhou o jogo!`;
            else if (initialUserChoice.beats === targetUserChoice.name) result = `${interaction.user} ganhou o jogo!`;
            else result = `Foi um empate!`;

            embed.setDescription(`${targetUserChoice.emoji} **|** ${targetUser} escolheu ${targetUserChoice.name}!\n${initialUserChoice.emoji} **|** ${interaction.user} escolheu ${targetUserChoice.name}!\n\n${result}`);

            await reply.edit({ embeds: [embed], components: [], content: `❌ **|** Jogo acabou!` });
            return;
        }
    } catch (error){
        console.error(`Error: ${error}`);
    }
}

export { comandoPedraExecutar };