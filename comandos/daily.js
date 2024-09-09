import fs from "fs";
let dailyCooldown = JSON.parse(fs.readFileSync(".data/dailyCooldown.json", "utf-8"));

function saveData() {
  fs.writeFileSync(".data/freedoms.json", JSON.stringify(freedoms, null, 2));
  fs.writeFileSync(".data/dailyCooldown.json", JSON.stringify(dailyCooldown, null, 2));
}

async function comandoDailyExecutar (interaction, options) {
  const now = new Date().toLocaleDateString("pt-BR");
  const userDailyId = interaction.user.id;

  if (dailyCooldown[userDailyId] === now) {
    await interaction.reply("❌ Você já coletou seu bônus diário hoje!");
  } else {
    const dailyFreedoms = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
    freedoms[userDailyId] = (freedoms[userDailyId] || 0) + dailyFreedoms;
    dailyCooldown[userDailyId] = now;

    saveData();

    await interaction.reply(
      `💸 **|** Você recebeu <:freedoms:1282757761406468128> ${dailyFreedoms} <:freedoms:1282757761406468128> freedoms! Agora você tem ${freedoms[userDailyId]} freedoms! 🥇`,
    );
  }
}

export { comandoDailyExecutar };