import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

async function comandoAnimeExecutar(interaction, options) {
    const subcommand = options.getSubcommand();

    if(subcommand === "expansão") {
        await interaction.deferReply();

        const randomMsg = Math.floor(Math.random() * 5)
        const target = options.getUser("alvo");
        let gifAtk = "https://i.ytimg.com/vi/OE6NLtc34hI/sddefault.jpg";

        if (randomMsg === 0) gifAtk = "https://i.pinimg.com/originals/83/85/46/838546ec7d2352266b860764d8b5ece0.gif";
        if (randomMsg === 1) gifAtk = "https://i.pinimg.com/originals/14/fc/7d/14fc7d1120735dd8e2064a38913ea339.gif";
        if (randomMsg === 2) gifAtk = "https://i.makeagif.com/media/1-08-2023/zEUAGD.gif";
        if (randomMsg === 3) gifAtk = "https://c.tenor.com/6HWDIY_uqsYAAAAd/tenor.gif";
        if (randomMsg === 4) gifAtk = "https://c.tenor.com/3fzEJTA3ykUAAAAC/tenor.gif";

        const attackEmbed = new EmbedBuilder({
            "description": `🥊 **| <@${interaction.user.id}> atacou <@${target.id}>!**`,
            "color": 0x8B0000,
            "image": {
                "url": gifAtk
            }
        })

        const stopPlsButton = new ButtonBuilder()
        .setCustomId("stopPlsButton-expansion")
        .setLabel("Para, por favor!")
        .setEmoji("😭")
        .setStyle(ButtonStyle.Danger)

        const fightButton = new ButtonBuilder()
        .setCustomId("fightButton-expansion")
        .setLabel("Vem pro fight, vem!")
        .setEmoji("🥊")
        .setStyle(ButtonStyle.Secondary)

        const expansionButtonDisplays = new ActionRowBuilder().addComponents(stopPlsButton, fightButton);

        await interaction.editReply({ content: `|| <@${target.id}> ||`, embeds: [attackEmbed], components: [expansionButtonDisplays]});
    }
}
export { comandoAnimeExecutar };