import fs from 'fs';
import path from 'path';
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

const commandExecutersFile = path.resolve('data', 'interactions', 'anime', 'commandExecuters.json');

function loadCommandExecuters() {
    if (fs.existsSync(commandExecutersFile)) {
        const data = fs.readFileSync(commandExecutersFile, 'utf-8');
        return JSON.parse(data);
    }
    return {};
}

function saveCommandExecuters(commandExecuters) {
    fs.writeFileSync(commandExecutersFile, JSON.stringify(commandExecuters, null, 2));
}

let commandExecuters = loadCommandExecuters();

async function comandoAnimeExecutar(interaction, options) {
    const subcommandGroup = options.getSubcommandGroup();
    const subcommand = options.getSubcommand();

    if (subcommandGroup === "jjk" && subcommand === "expansão") {
        await interaction.deferReply();

        const randomMsg = Math.floor(Math.random() * 5);
        const target = options.getUser("alvo");
        let gifAtk = "https://i.ytimg.com/vi/OE6NLtc34hI/sddefault.jpg";

        const executerUser = interaction.user;
        commandExecuters[interaction.id] = executerUser;
        saveCommandExecuters(commandExecuters);

        if (randomMsg === 0) gifAtk = "https://i.pinimg.com/originals/83/85/46/838546ec7d2352266b860764d8b5ece0.gif";
        if (randomMsg === 1) gifAtk = "https://i.pinimg.com/originals/14/fc/7d/14fc7d1120735dd8e2064a38913ea339.gif";
        if (randomMsg === 2) gifAtk = "https://i.makeagif.com/media/1-08-2023/zEUAGD.gif";
        if (randomMsg === 3) gifAtk = "https://c.tenor.com/6HWDIY_uqsYAAAAd/tenor.gif";
        if (randomMsg === 4) gifAtk = "https://c.tenor.com/3fzEJTA3ykUAAAAC/tenor.gif";

        const attackEmbed = new EmbedBuilder({
            "description": `🥊 **| ${executerUser} atacou ${target}!**`,
            "color": 0x8B0000,
            "image": {
                "url": gifAtk
            }
        });

        const stopPlsButton = new ButtonBuilder()
            .setCustomId(`stopPlsButton-expansion`)
            .setLabel("Para, por favor!")
            .setEmoji("😭")
            .setStyle(ButtonStyle.Danger);

        const fightButton = new ButtonBuilder()
            .setCustomId(`fightButton-expansion-${interaction.id}`)
            .setLabel("Vem pro fight, vem!")
            .setEmoji("🥊")
            .setStyle(ButtonStyle.Secondary);

        const expansionButtonDisplays = new ActionRowBuilder().addComponents(stopPlsButton, fightButton);

        if (target.id === executerUser.id) {
            attackEmbed.setDescription(`❓ **| ${executerUser}... abriu uma expansão de domínio sozinho?**`);
            attackEmbed.setFooter({ text: "Você está ciente de que ela não causa nenhum efeito em você mesmo, né?" });
            attackEmbed.setImage(null);

            await interaction.editReply({ content: `||${target}>||`, embeds: [attackEmbed] });
        } else if (target.id === "911646421441187931") {
            attackEmbed.setDescription(`😡 **| ${executerUser} TENTOU ME ATACAR!!!**`);
            attackEmbed.setFooter({ text: "Agora eu fiquei bravo..." });

            await interaction.editReply({ content: `||${executerUser}||`, embeds: [attackEmbed] });
        } else if (target.id != "911646421441187931" && target.id != executerUser.id) {
            await interaction.editReply({ content: `||${target}||`, embeds: [attackEmbed], components: [expansionButtonDisplays] });
        }
    }
}

async function getExecuter() {
    return loadCommandExecuters();
}

export { comandoAnimeExecutar, getExecuter };