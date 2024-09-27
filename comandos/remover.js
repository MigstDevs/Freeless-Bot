import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import fetch from 'node-fetch';

async function comandoRemoverExecutar(interaction, options) {
    const subcommand = options.getSubcommand();
    if (subcommand === "fundo") {
        await interaction.deferReply();
        const image = options.getAttachment("imagem");

        const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: {
                'X-Api-Key': 'c8i7vQfvwr9tzk6GrMcAvUCr',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_url: image.proxyURL,
                size: 'auto',
            }),
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const attachment = new AttachmentBuilder(buffer, {
            name: 'removebg.png',
        });

        const embed = new EmbedBuilder()
            .setTitle("**🫠 Fundo Removido!**")
            .setColor('Blurple')
            .setImage("attachment://removebg.png");

        await interaction.editReply({ embeds: [embed], files: [attachment] });
    }
}

export { comandoRemoverExecutar };