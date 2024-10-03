async function comandoSairExecutar(interaction) {
    const user = interaction.user;
    const member = interaction.guild.members.cache.get(user.id); 
    const owner = await interaction.guild.fetchOwner();
    const botMember = interaction.guild.members.cache.get(interaction.client.user.id); 

    await interaction.deferReply();

    if (user.id === owner.id) {
        return await interaction.editReply(`🫤 **|** Cara... O que cê tá pensando?\n👑 **|** Você, <@${owner.id}>, é o **DONO** deste servidor. Donos do próprio servidor não podem ~~ser expulsos~~ sair do servidor!`);
    }

    if (!interaction.guild.me.permissions.has('KICK_MEMBERS')) {
        return await interaction.editReply(`🚫 **|** Eu não tenho permissão para te tirar deste servidor!`);
    }

    if (botMember.roles.highest.position <= member.roles.highest.position) {
        return await interaction.editReply(`😬 **|** Eu não posso ~~expulsar~~ remover você, <@${user.id}>, porque meu cargo é menor ou igual ao seu na hierarquia de cargos!`);
    }

    await interaction.editReply(`💔 **|** Woosh! E lá se vai ele...\n😭 **|** <@${user.id}> saiu do servidor!`);
    await member.kick("Quis sair do servidor 😢");
}

export { comandoSairExecutar };