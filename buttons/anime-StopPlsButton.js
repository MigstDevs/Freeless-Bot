async function stopRequestExpansion(interaction) {
    const chance = Math.floor(Math.random() * 10)
    if (chance <= 3) {
      await interaction.reply(`🙇 **|** Você, <@${interaction.user.id}>, implora por piedade.\n👍 **|** Surpreendentemente, seu inimigo teve compaixão por você! Uau! Isso foi fácil...`);
    } else {
      await interaction.reply(`🙇 **|** Você, <@${interaction.user.id}>, implora por piedade.\n❌ **|** Seu inimigo recusou! Uau! Ele nem liga pra tu...\n😐 **|** Você tenta atacar seu inimigo! Não funcionou...\n|| A interação acabou. ||`);
    }
}

export { stopRequestExpansion };