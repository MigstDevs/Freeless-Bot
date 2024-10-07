import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
import fs from 'fs';
import path from 'path';

const POLL_DATA_PATH = path.resolve('data', 'interactions', 'polls', 'pollData.json');

const badgeTranslations = {
    "HypeSquadOnlineHouse1": "Hypesquad Bravery",
    "HypeSquadOnlineHouse2": "Hypesquad Brilliance",
    "HypeSquadOnlineHouse3": "Hypesquad Balance",
    "ActiveDeveloper": "Desenvolvedor Ativo",
    "VerifiedBot": "Bot Verificado",
    "VerifiedBotDeveloper": "Desenvolvedor de Bot Verificado",
    "BugHunterLevel1": "Caçador de Bugs Nível 1",
    "BugHunterLevel2": "Caçador de Bugs Nível 2",
    "EarlySupporter": "Apoiador Antigo",
    "Partner": "Parceiro do Discord",
    "Staff": "Equipe do Discord",
    "HypeSquadEvents": "Eventos Hypesquad",
    "PremiumEarlySupporter": "Apoiador Nitro Antigo",
};

function translateBadges(badgeArray) {
    return badgeArray.map(badge => badgeTranslations[badge] || badge).join(', ');
}

async function comandoGerarExecutar(interaction, options) {
    await interaction.deferReply();
    const subcommand = options.getSubcommand();

    if (subcommand === "enquete") {
        const topicPoll = options.getString("título");
        const description = options.getString("descrição");
        const soloImage = options.getAttachment("imagem");
        const imageUrl = soloImage ? soloImage.url : null;

        const yesTextButton = options.getString("botão_sim_texto");
        const noTextButton = options.getString("botão_não_texto");

        const yesEmojiButton = options.getString("botão_sim_emoji");
        const noEmojiButton = options.getString("botão_não_emoji");

        const duration = options.getString("duração");

        let durationInSeconds = 0;
        const durationValue = parseInt(duration.slice(0, -1));
        const durationUnit = duration.slice(-1);

        if (durationUnit === 'm') {
            durationInSeconds = durationValue * 60;
        } else if (durationUnit === 'h') {
            durationInSeconds = durationValue * 60 * 60;
        } else if (durationUnit === 'd') {
            durationInSeconds = durationValue * 24 * 60 * 60;
        } else {
            durationInSeconds = durationValue * 60;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const endTime = currentTime + durationInSeconds;

        let responseEmbed = new EmbedBuilder({
            "title": topicPoll,
            "color": 0x8B0000,
        });

        if (imageUrl) {
            responseEmbed.setImage(imageUrl);
        }

        let buttonAgree = new ButtonBuilder()
            .setCustomId(`buttonAgree-poll-${interaction.id}`)
            .setEmoji(yesEmojiButton)
            .setLabel(yesTextButton)
            .setStyle(ButtonStyle.Success);

        let buttonDisagree = new ButtonBuilder()
            .setCustomId(`buttonDisagree-poll-${interaction.id}`)
            .setEmoji(noEmojiButton)
            .setLabel(noTextButton)
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder().addComponents(buttonAgree, buttonDisagree);

        if (description) {
            responseEmbed.setDescription(description + `\nEssa enquete acaba <t:${endTime}:R>.`);
        } else {
            responseEmbed.setDescription(`Essa enquete acaba <t:${endTime}:R>.`);
        }

        const interactionReply = await interaction.editReply({ embeds: [responseEmbed], components: [actionRow] });

        let votes = {
            agree: 0,
            disagree: 0
        };

        const pollData = {
            interactionId: interaction.id,
            endTime: endTime,
            votes: votes,
            yesTextButton: yesTextButton,
            noTextButton: noTextButton,
            channelId: interaction.channelId,
            messageId: interactionReply.id,
            voters: {}
        };

        savePollData(pollData);

        const collector = interactionReply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: durationInSeconds * 1000
        });

        collector.on('collect', async i => {
            const userId = i.user.id;
            const pollData = loadPollData()[interaction.id];
            const previousVote = pollData.voters[userId];

            if (i.customId === `buttonAgree-poll-${interaction.id}`) {
                if (previousVote === 'agree') {
                    await i.reply({ content: `Você já votou em **${yesTextButton}**!`, ephemeral: true });
                    return;
                } else if (previousVote === 'disagree') {
                    pollData.votes.disagree -= 1;
                    pollData.votes.agree += 1;
                    pollData.voters[userId] = 'agree';
                    await i.reply({ content: `Você mudou seu voto para **${yesTextButton}**!`, ephemeral: true });
                } else {
                    pollData.votes.agree += 1;
                    pollData.voters[userId] = 'agree';
                    await i.reply({ content: `Você votou em **${yesTextButton}**!`, ephemeral: true });
                }
            } else if (i.customId === `buttonDisagree-poll-${interaction.id}`) {
                if (previousVote === 'disagree') {
                    await i.reply({ content: `Você já votou em **${noTextButton}**!`, ephemeral: true });
                    return;
                } else if (previousVote === 'agree') {
                    pollData.votes.agree -= 1;
                    pollData.votes.disagree += 1;
                    pollData.voters[userId] = 'disagree';
                    await i.reply({ content: `Você mudou seu voto para **${noTextButton}**!`, ephemeral: true });
                } else {
                    pollData.votes.disagree += 1;
                    pollData.voters[userId] = 'disagree';
                    await i.reply({ content: `Você votou em **${noTextButton}**!`, ephemeral: true });
                }
            }

            savePollData(pollData);
        });

        collector.on('end', async () => {
            endPoll(interaction, pollData.votes, yesTextButton, noTextButton, yesEmojiButton, noEmojiButton, topicPoll, imageUrl);
            deletePollData(interaction.id);
        });
    } else if (subcommand === "dados-usuário") {
        const user = options.getUser("usuário");
        const userFlags = await user.fetchFlags();
        const translatedBadges = translateBadges(userFlags.toArray());

        let embeddedUserInfo = new EmbedBuilder({
            title: `Dados do Usuário "${user.displayName} (${user.username}, ${user.id})"`,
            description: "🤔 O que esse usuário tem de especial? 🤔",
            fields: [
                {
                    name: "📝 Nome de Exibição",
                    value: user.displayName || "Não disponível",
                    inline: true
                },
                {
                    name: "🧑 Nome de Usuário",
                    value: user.username || "Não disponível",
                    inline: true
                },
                {
                    name: "🪪 ID do Usuário",
                    value: user.id || "Não disponível"
                },
                {
                    name: "🎖️ Emblemas do Usuário",
                    value: translatedBadges || 'Nenhum emblema'
                }
            ]
        });

        await interaction.editReply({ embeds: [embeddedUserInfo]});
    }
}

function savePollData(pollData) {
    let pollFile = fs.existsSync(POLL_DATA_PATH) ? fs.readFileSync(POLL_DATA_PATH) : '{}';
    let pollStore = JSON.parse(pollFile);
    pollStore[pollData.interactionId] = pollData;
    fs.writeFileSync(POLL_DATA_PATH, JSON.stringify(pollStore, null, 2));
}

function loadPollData() {
    if (fs.existsSync(POLL_DATA_PATH)) {
        return JSON.parse(fs.readFileSync(POLL_DATA_PATH));
    }
    return {};
}

function deletePollData(interactionId) {
    let pollFile = fs.existsSync(POLL_DATA_PATH) ? fs.readFileSync(POLL_DATA_PATH) : '{}';
    let pollStore = JSON.parse(pollFile);
    delete pollStore[interactionId];
    fs.writeFileSync(POLL_DATA_PATH, JSON.stringify(pollStore, null, 2));
}

async function endPoll(interaction, votes, yesTextButton, noTextButton, yesEmojiButton, noEmojiButton, topicPoll, imageUrl) {
    const pollData = loadPollData()[interaction.id];
    if (!pollData) return;

    const pollMessage = await interaction.channel.messages.fetch(pollData.messageId);

    const disabledActionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`buttonAgree-poll-${interaction.id}`).setDisabled(true).setLabel(yesTextButton).setEmoji(yesEmojiButton).setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`buttonDisagree-poll-${interaction.id}`).setDisabled(true).setLabel(noTextButton).setEmoji(noEmojiButton).setStyle(ButtonStyle.Danger)
        );

    let resultEmbed = new EmbedBuilder()
        .setTitle(`Resultado da enquete: ${topicPoll}, ${yesTextButton} vs ${noTextButton}`)
        .setColor(0x8B0000)
        .setDescription(`**${yesTextButton}**: ${votes.agree} votos\n**${noTextButton}**: ${votes.disagree} votos`);

        if (imageUrl) {
            resultEmbed.setImage(imageUrl);
        }

    if (votes.agree > votes.disagree) {
        resultEmbed.setFooter({ text: `Vencedor: ${yesTextButton}` });
    } else if (votes.disagree > votes.agree) {
        resultEmbed.setFooter({ text: `Vencedor: ${noTextButton}` });
    } else {
        resultEmbed.setFooter({ text: "Empate!" });
    }

    await pollMessage.edit({ embeds: [resultEmbed], components: [disabledActionRow] });
}

export { comandoGerarExecutar };