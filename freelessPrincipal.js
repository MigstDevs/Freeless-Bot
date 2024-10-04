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
  } else if (interaction.isMessageContextMenuCommand()) {
    const { commandName, targetMessage } = interaction;
  
    if (commandName === "Obter Informações") {
      await interaction.reply({
        content: `Conteúdo da mensagem: ${targetMessage.content}\nAutor: <@${targetMessage.author.id}>`,
        ephemeral: true
      });
    }
  }  
});

client.login(token);