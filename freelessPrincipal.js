import fs from "fs";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import express from "express";
import dotenv from 'dotenv';


import { comandoPingExecutar } from "./commands/ping.js";
import { comandoConviteExecutar } from "./commands/convite.js";
import { comandoMinecraftExecutar } from "./commands/minecraft.js";
import { comandoAjudaExecutar } from "./commands/ajuda.js";
import { comandoFreedomsExecutar } from "./commands/freedoms.js";
import { comandoDailyExecutar } from "./commands/daily.js";
import { comandoAnimeExecutar } from "./commands/anime.js";
import { comandoPensarExecutar } from "./commands/pensar.js";
import { comandoRemoverExecutar } from "./commands/remover.js";
import { comandoGerarExecutar } from "./commands/gerar.js";
import { comandoSairExecutar } from "./commands/sair.js";
import { comandoInfernoExecutar } from "./commands/inferno.js";
import { comandoNukeExecutar } from "./commands/nuke.js";
import { comandoPedraExecutar } from "./commands/pedra.js";
import { comandoConfigurarExecutar } from "./commands/configurar.js";

import { stopRequestExpansion } from "./buttons/anime-StopPlsButton.js";
import { fightExpansion } from "./buttons/anime-fightButton.js";

dotenv.config();

const app = express();

const token = process.env.token;
const clientId = process.env.clientId;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
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
        name: `CARGOS AUTOMÁTICOS!`,
        type: ActivityType.Listening,
      }
    ],
    status: 'online',
  });

  let commands = JSON.parse(fs.readFileSync('./data/interactions/commands.json', "utf-8"));

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

client.on("guildMemberAdd", async (member) => {
  const autoroleFilePath = './data/interactions/autorole/autoroles.json';

  if (fs.existsSync(autoroleFilePath)) {
    const autoroleData = JSON.parse(fs.readFileSync(autoroleFilePath, 'utf-8'));

    if (autoroleData[member.guild.id]) {
      const roleId = autoroleData[member.guild.id];

      try {
        const role = await member.guild.roles.fetch(roleId);
        if (role) {
          await member.roles.add(role);
        } else return;
      } catch (error) {
        console.error(`Error: ${error}`);
      }
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
    case "gerar":
      comandoGerarExecutar(interaction, options);
      break;
    case "sair":
      comandoSairExecutar(interaction);
      break;
    case "inferno":
      comandoInfernoExecutar(interaction, options);
      break;
    case "nuke":
      comandoNukeExecutar(interaction, options);
      break;
    case "pedra":
      comandoPedraExecutar(interaction, options);
      break;
    case "configurar":
      comandoConfigurarExecutar(interaction, options);
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

      await thread.send(`Ticket opened! The ticket's opener is ${user}! If you want to close the ticket, just send "-ticket end"!\n-# <@&1289010136957845524>`,);

      await interaction.reply({ content: `Ticket created successfully! It can be located at <#${thread.id}>.`, ephemeral: true})
    } else if (interaction.customId.startsWith("fightButton-expansion-")) {
      fightExpansion(interaction);
    }
  } else if (interaction.isMessageContextMenuCommand()) {
    const { commandName, targetMessage } = interaction;
  
    if (commandName === "Obter Informações") {
      await interaction.reply({
        content: `Conteúdo da mensagem: ${targetMessage.content}\nAutor: ${targetMessage.author}`,
        ephemeral: true
      });
    }
  }  
});

client.login(token);