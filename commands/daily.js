import fs from "fs";
import path from "path";

const dailyCooldownFile = path.resolve('data', 'freedoms', 'dailyCooldown.json');
const freedomsFile = path.resolve('data', 'freedoms', 'freedoms.json');

let dailyCooldown = JSON.parse(fs.readFileSync(dailyCooldownFile, "utf-8"));
let freedoms = JSON.parse(fs.readFileSync(freedomsFile, "utf-8"));

function saveData() {
  fs.writeFileSync(freedomsFile, JSON.stringify(freedoms, null, 2));
  fs.writeFileSync(dailyCooldownFile, JSON.stringify(dailyCooldown, null, 2));
}

async function comandoDailyExecutar (interaction) {
  await interaction.deferReply();
  const now = new Date().toLocaleDateString("pt-BR");
  const userDailyId = interaction.user.id;

  if (dailyCooldown[userDailyId] === now) {
    await interaction.editReply("❎ **|** Você já coletou seu bônus diário hoje!");
  } else {
    const dailyFreedoms = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
    freedoms[userDailyId] = (freedoms[userDailyId] || 0) + dailyFreedoms;
    dailyCooldown[userDailyId] = now;

    saveData();

    await interaction.editReply(`💸 **|** Você recebeu <:freedoms:1282757761406468128> ${dailyFreedoms} <:freedoms:1282757761406468128> freedoms! Agora você tem ${freedoms[userDailyId]} freedoms! 🥇`,);
  }
}

export { comandoDailyExecutar };