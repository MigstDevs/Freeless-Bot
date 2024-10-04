import { Client, GatewayIntentBits } from "discord.js";
import dotenv from 'dotenv';

const defaultPrefix = "fl!";
let waitingForPrefix = false;
dotenv.config();

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

const token = process.env.token;

const guildPrefixesFile = "./data/prefixes/guildPrefixes.json";

const freedomsFile = "./data/freedoms/freedoms.json";
const dailyCooldownFile = "./data/freedoms/dailyCooldown.json";

let freedoms = JSON.parse(fs.readFileSync(freedomsFile, "utf-8"));
let dailyCooldown = JSON.parse(fs.readFileSync(dailyCooldownFile, "utf-8"));
let guildPrefixes = JSON.parse(fs.readFileSync(guildPrefixesFile, "utf-8"));

function saveData() {
  fs.writeFileSync(freedomsFile, JSON.stringify(freedoms, null, 2));
  fs.writeFileSync(dailyCooldownFile, JSON.stringify(dailyCooldown, null, 2));
  fs.writeFileSync(guildPrefixesFile, JSON.stringify(guildPrefixes, null, 2));
}

client.on("messageCreate", async (message) => {
    if (waitingForPrefix) {
      if (message.author.bot) return;
  
      const guildId = message.guild.id;
      guildPrefixes[guildId] = message.content;
  
      waitingForPrefix = false;
      message.reply(`O prefixo foi definido como "${message.content}" para este servidor.`);
      saveData();
    }
  
    const guildPrefix = guildPrefixes[message.guild.id] || defaultPrefix;
  
    if (message.content === "-ticket end") {
      const thread = message.channel;
  
      if (thread.isThread() && thread.name.endsWith("-ticket")) {
          await thread.delete('Ticket closed by the "-ticket end" command.');
      } else {
        message.reply("This command can only be used inside a ticket.");
      }
    }
  
    if (message.content === guildPrefix + "prefixo") {
      const guildOwner = await message.guild.fetchOwner();
      const isOwner = message.member.id === guildOwner.id;
  
      const memberPermissions = message.member.permissions;
      const hasManageGuildPermission = memberPermissions.has("ManageGuild");
  
      if (!hasManageGuildPermission && !isOwner) {
        message.reply("❌ Você não tem permissão para usar este comando.");
        return;
      }
  
      message.reply(
        `Atualmente, o prefixo do Freeless é "${guildPrefix}", e ele pode ser alterado para qualquer outro caractere! Envie uma mensagem com o novo prefixo e eu irei alterar o meu prefixo para ele.`
      );
      waitingForPrefix = true;
    }
  
    if (message.content.startsWith(guildPrefix + "freedoms")) {
      const userId = message.author.id;
  
      const userFreedoms = freedoms[userId] || 0;
  
      let response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128>freedoms! A _liberdade_ está perto! 🪙`;
  
      if (userFreedoms <= 0) {
        response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 😭 **|** Em pobreza, só perde pra mim!`;
      } else if (userFreedoms >= 10000 && userFreedoms < 50000) {
        response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💰 **|** É um salário mínimo, e portanto, pode melhorar, mas é melhor do que nada!`;
      } else if (userFreedoms >= 50000 & userFreedoms < 100000) {
        response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🤑 **|** Já tá bom, mas continue com seus sonhos! (Cadê a <@297153970613387264> kkkk)`;
      } else if (userFreedoms >= 100000 & userFreedoms < 200000 ) {
        response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🫢 **|** Uau! Você tá incrível, continua assim!`;
      } else if (userFreedoms >= 200000 && userFreedoms < 500000) {
        response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 💵 **|** Nossa! Você tá rico!`;
      } else if (userFreedoms >= 500000) {
        response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128> freedoms!\n 🪙 **|** A _liberdade_ está perto!`;
      }
  
      message.reply(response);
    }
  
    if (message.content.startsWith(guildPrefix + "daily")) {
      const userId = message.author.id;
      const now = new Date().toLocaleDateString("pt-BR");
  
      if (dailyCooldown[userId] === now) {
        message.reply("❌ Você já coletou seu bônus diário hoje!");
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
  });

client.login()