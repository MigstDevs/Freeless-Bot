import fs from "fs";

async function comandoFreedomsExecutar (interaction, options) {
  await interaction.deferReply();
  let freedoms = JSON.parse(fs.readFileSync("./data/freedoms/freedoms.json", "utf-8"));
  const chosen_user = options.getUser("user") || interaction.user;
  const userId = chosen_user.id;
  const userFreedoms = freedoms[userId] || 0;

  if (userFreedoms <= 0) {
    return await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 😭 **|** Em pobreza, só perde pra mim!`);
  } else if (userFreedoms >= 10000 && userFreedoms < 50000) {
    return await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💰 **|** É um salário mínimo, e portanto, pode melhorar, mas é melhor do que nada!`);
  } else if (userFreedoms >= 50000 & userFreedoms < 100000) {
    return await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🤑 **|** Já tá bom, mas continue com seus sonhos! (Cadê a <@297153970613387264> kkkk)`);
  } else if (userFreedoms >= 100000 & userFreedoms < 200000 ) {
    return await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🫢 **|** Uau! Você tá incrível, continua assim!`);
  } else if (userFreedoms >= 200000 && userFreedoms < 500000) {
    return await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💵 **|** Nossa! Você tá rico!`);
  } else if (userFreedoms >= 500000) {
    return await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🪙 **|** A _liberdade_ está perto!`);
  }
}

export { comandoFreedomsExecutar };