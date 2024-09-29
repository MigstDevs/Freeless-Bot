import fs from "fs";
import { Client, GatewayIntentBits, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import express from "express";
import dotenv from 'dotenv';


import { comandoPingExecutar } from "./commands/ping.js";
import { comandoConviteExecutar } from "./commands/convite.js";
import { comandoMinecraftExecutar } from "./commands/minecraft.js";
import { comandoAjudaExecutar } from "./commands/ajuda.js";
import { comandoFreedomsExecutar } from "./commands/freedoms.js";
import { comandoTocarExecutar } from "./commands/tocar.js";
import { comandoDailyExecutar } from "./commands/daily.js";
import { comandoAnimeExecutar } from "./commands/anime.js";
import { comandoPensarExecutar } from "./commands/pensar.js";
import { comandoRemoverExecutar } from "./commands/remover.js";


import { stopRequestExpansion } from "./buttons/anime-StopPlsButton.js";
import { fightExpansion } from "./buttons/anime-fightButton.js";

dotenv.config();

const app = express();
const defaultPrefix = "fl!";
const guildPrefixesFile = "./data/guildPrefixes.json";
let waitingForPrefix = false;

const freedomsFile = "./data/freedoms.json";
const dailyCooldownFile = "./data/dailyCooldown.json";

let freedoms = JSON.parse(fs.readFileSync(freedomsFile, "utf-8"));
let dailyCooldown = JSON.parse(fs.readFileSync(dailyCooldownFile, "utf-8"));
let guildPrefixes = JSON.parse(fs.readFileSync(guildPrefixesFile, "utf-8"));

const token = process.env.token;
const clientId = process.env.clientId;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

app.listen(3000, () => {
  console.log("O Bot Sem Liberdade foi Preso! Inicialização bem-sucedida");
});

app.get("/", (req, res) => {
  res.send("Freeless Bot - O Bot que se importa");
});

const rest = new REST({ version: "10" }).setToken(token);

client.on("ready", async () => {
  console.log(`O Freeless tá online como ${client.user.tag}`);
  client.user.setPresence({
    activities: [
      {
        name: `falar de que você recebe ajuda ao executar /ajuda`,
        type: ActivityType.Listening,
      }
    ],
    status: 'online',
  });

  let commands = JSON.parse(fs.readFileSync('./data/commands.json', "utf-8"));

  try {
    console.log("Comecei a atualizar os comandos barra.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Terminei de atualizar os comandos barra.");
  } catch (error) {
    console.error(error);
  }
});

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
    message.reply(
      `O prefixo foi definido como "${message.content}" para este servidor.`
    );
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
    const response = `💸 **|** Você possui <:freedoms:1282757761406468128> ${userFreedoms} <:freedoms:1282757761406468128>freedoms! A _liberdade_ está perto! 🪙`;
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

client.on("interactionCreate", async (interaction) => {
  if(interaction.isCommand()) {
    const { commandName, options } = interaction;

  switch (commandName) {
    case "ping":
      comandoPingExecutar(interaction);
      break;
    case "convite":
      comandoConviteExecutar(interaction);
      break;
    case "tocar":
      comandoTocarExecutar(interaction, options);
      break;
    case "minecraft":
      comandoMinecraftExecutar(interaction, options);
      break;
    case "ajuda":
      comandoAjudaExecutar(interaction);
      break;
    case "freedoms":
      comandoFreedomsExecutar(interaction, options);
      break;
    case "daily":
      comandoDailyExecutar(interaction);
      break;
    case "anime":
      comandoAnimeExecutar(interaction, options);
      break;
    case "pensar":
      comandoPensarExecutar(interaction);
      break;
    case "remover":
      comandoRemoverExecutar(interaction, options);
      break;
  }
  } else if (interaction.isButton()) {
    if (interaction.customId === "botServerCheck") {
      await interaction.reply({ content: '💻 **|** Atualmente, o bot tá rodando no `Render`, website https://freeless-bot-discord-20xw.onrender.com e ID `srv-creuu2bv2p9s73d351b0`!', ephemeral: true})
    } else if (interaction.customId === "stopPlsButton-expansion") {
      stopRequestExpansion(interaction);
    } else if (interaction.customId === "ticketButtonOFFICIAL") {
      const { user } = interaction;
      const threadName = `${user.username}-ticket`;

      const thread = await interaction.channel.threads.create({
        name: threadName,
        type: 12,
        reason: `Ticket created by ${user.username}`,
      });

      await thread.members.add(user.id);

      await thread.send(`Ticket opened! The ticket's opener is <@${user.id}>! If you want to close the ticket, just send "-ticket end"!\n-# <@&1289010136957845524>`,);

      await interaction.reply({ content: `Ticket created successfully! It can be located at <#${thread.id}>.`, ephemeral: true})
    } else if (interaction.customId.startsWith("fightButton-expansion-")) {
      fightExpansion(interaction);
    }
  }
});

client.login(token);