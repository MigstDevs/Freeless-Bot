async function comandoSairExecutar(interaction) {
    const user = interaction.user;

    await interaction.reply('💔 **|** Woosh! E lá se vai ele...' + `\n😭 **|** <@${user.id}> saiu do servidor!`);

    user.kick("Quis sair do servidor 😢");
}

export { comandoSairExecutar };