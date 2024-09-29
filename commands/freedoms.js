import fs from "fs";

async function comandoFreedomsExecutar (interaction, options) {
  let freedoms = JSON.parse(fs.readFileSync("./data/freedoms.json", "utf-8"));
  const userId =
    options.getUser("user")?.id || interaction.user.id;
  const userFreedoms = freedoms[userId] || 0;
  const response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms! A _liberdade_ está perto! 🪙`;
  await interaction.reply(response);
}

export { comandoFreedomsExecutar };