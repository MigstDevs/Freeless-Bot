import fs from 'fs';

const defaultPrefix = "fl!";
let waitingForPrefix = false;

const guildPrefixesFile = "./data/prefixes/guildPrefixes.json";
let guildPrefixes = JSON.parse(fs.readFileSync(guildPrefixesFile, "utf-8"));

function saveData() {
    fs.writeFileSync(guildPrefixesFile, JSON.stringify(guildPrefixes, null, 2));
}

async function prefixChange(message) {
  const guildPrefix = guildPrefixes[message.guild.id] || defaultPrefix;
  
    if (waitingForPrefix) {
        if (message.author.bot) return;
    
        const guildId = message.guild.id;
        guildPrefixes[guildId] = message.content;
    
        waitingForPrefix = false;
        message.reply(`O prefixo foi definido como "${message.content}" para este servidor.`);
        saveData();
    }
    
    if (message.content === guildPrefix + "prefixo") {
        const guildOwner = await message.guild.fetchOwner();
        const isOwner = message.member.id === guildOwner.id;
    
        const memberPermissions = message.member.permissions;
        const hasManageGuildPermission = memberPermissions.has("ManageGuild");
    
        if (!hasManageGuildPermission && !isOwner) {
          message.reply("❎ **|** Você não tem permissão para usar este comando.");
          return;
        }
    
        message.reply(
          `❗ **|** Atualmente, o prefixo do Freeless é "${guildPrefix}", e ele pode ser alterado para qualquer outro caractere! Envie uma mensagem com o novo prefixo e eu irei alterar o meu prefixo para ele.`
        );
        waitingForPrefix = true;
    }
}

export { prefixChange };