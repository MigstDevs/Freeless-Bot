import fs from 'fs';

const freedomsFile = "./data/freedoms/freedoms.json";
let freedoms = JSON.parse(fs.readFileSync(freedomsFile, "utf-8"));

const defaultPrefix = "fl!";
const guildPrefixesFile = "./data/prefixes/guildPrefixes.json";
let guildPrefixes = JSON.parse(fs.readFileSync(guildPrefixesFile, "utf-8"));

async function freedomsCheck(message, client) {
  const guildPrefix = guildPrefixes[message.guild.id] || defaultPrefix;
  var loritta = client.users.fetch('297153970613387264');

    if (message.content.startsWith(guildPrefix + "freedoms")) {
        const userId = message.author.id;
    
        const userFreedoms = freedoms[userId] || 0;
    
        let response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128>freedoms! A _liberdade_ está perto! 🪙`;
    
        if (userFreedoms <= 0) {
          response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 😭 **|** Em pobreza, só perde pra mim!`;
        } else if (userFreedoms >= 1 && userFreedoms < 10000) {
          response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💲 **|** Pelo menos tem alguma coisa, mas não dá pra comprar nem um pão!`;
        } else if (userFreedoms >= 10000 && userFreedoms < 50000) {
          response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💰 **|** É um salário mínimo, e portanto, pode melhorar, mas é melhor do que nada!`;
        } else if (userFreedoms >= 50000 & userFreedoms < 100000) {
          if (loritta) response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🤑 **|** Já tá bom, mas continue com seus sonhos! (Cadê a ${loritta} kkkk)`;
          else response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🤑 **|** Já tá bom, mas continue com seus sonhos!`;
        } else if (userFreedoms >= 100000 & userFreedoms < 200000 ) {
          response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🫢 **|** Uau! Você tá incrível, continua assim!`;
        } else if (userFreedoms >= 200000 && userFreedoms < 500000) {
          response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💵 **|** Nossa! Você tá rico!`;
        } else if (userFreedoms >= 500000) {
          response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🪙 **|** A _liberdade_ está perto!`;
        }
    
        message.reply(response);
      }
}

export { freedomsCheck };