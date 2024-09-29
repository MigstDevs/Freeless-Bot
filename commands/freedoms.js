import fs from "fs";

async function comandoFreedomsExecutar (interaction, options) {
  await interaction.deferReply();
  let freedoms = JSON.parse(fs.readFileSync("./data/freedoms/freedoms.json", "utf-8"));
  const chosen_user = options.getUser("user") || interaction.user;
  const userId = chosen_user.id;
  const userFreedoms = freedoms[userId] || 0;
  await interaction.editReply(`💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms! A _liberdade_ está perto! 🪙`);
}

export { comandoFreedomsExecutar };