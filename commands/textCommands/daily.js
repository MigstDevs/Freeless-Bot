import fs from 'fs';

const freedomsFile = "./data/freedoms/freedoms.json";
let freedoms = JSON.parse(fs.readFileSync(freedomsFile, "utf-8"));

const defaultPrefix = "fl!";
const guildPrefixesFile = "./data/prefixes/guildPrefixes.json";
let guildPrefixes = JSON.parse(fs.readFileSync(guildPrefixesFile, "utf-8"));

const dailyCooldownFile = "./data/freedoms/dailyCooldown.json";

let dailyCooldown = JSON.parse(fs.readFileSync(dailyCooldownFile, "utf-8"));

function saveData() {
    fs.writeFileSync(freedomsFile, JSON.stringify(freedoms, null, 2));
    fs.writeFileSync(dailyCooldownFile, JSON.stringify(dailyCooldown, null, 2));
}

async function dailyGrab(message) {
  const guildPrefix = guildPrefixes[message.guild.id] || defaultPrefix;
  
    if (message.content === guildPrefix + "daily") {
        const userId = message.author.id;
        const now = new Date().toLocaleDateString("pt-BR");
    
        if (dailyCooldown[userId] === now) {
          message.reply("❎ **|** Você já coletou seu bônus diário hoje!");
        } else {
          const dailyFreedoms = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
          freedoms[userId] = (freedoms[userId] || 0) + dailyFreedoms;
          dailyCooldown[userId] = now;
    
          saveData();
    
          message.reply(
            `💸 **|** Você recebeu <:freedoms:1282757761406468128> ${dailyFreedoms} <:freedoms:1282757761406468128> freedoms! Agora você tem ${freedoms[userId]} freedoms! 🥇`
          );
        }
      }
}

export { dailyGrab };