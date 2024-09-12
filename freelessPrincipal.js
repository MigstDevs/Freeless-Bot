// Imports de arquivo
import { comandoConviteExecutar } from "./comandos/convite.js";
import { comandoMinecraftExecutar } from "./comandos/minecraft.js";
import { comandoAjudaExecutar } from "./comandos/ajuda.js";
import { comandoFreedomsExecutar } from "./comandos/freedoms.js";
import { comandoTocarExecutar } from "./comandos/tocar.js";
import { comandoDailyExecutar } from "./comandos/daily.js";
import fs from "fs";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import express from "express";

const app = express();

let defaultPrefix = "fl!";
let guildPrefixes = new Map();
let waitingForPrefix = false;

let commandHistory = [];
const freedomsFile = "./comandos/data/freedoms.json";
const dailyCooldownFile = "./comandos/data/dailyCooldown.json";

// Load data from JSON files
let freedoms = JSON.parse(fs.readFileSync(freedomsFile, "utf-8"));
let dailyCooldown = JSON.parse(fs.readFileSync(dailyCooldownFile, "utf-8"));

const token = process.env.token;
const clientId = "911646421441187931";

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

  const commands = [
    {
      name: "convite",
      description: "Obtêm o link de convite do bot.",
    },
    {
      name: "tocar",
      description: "Toca uma música no canal de voz.",
      options: [
        {
          name: "dados",
          description: "A URL ou termo de pesquisa da música.",
          type: 3,
          required: true,
        },
        {
          name: "plataforma",
          description: "A plataforma da qual buscar a música.",
          type: 3,
          required: false,
          choices: [
            { name: "YouTube", value: "youtube" },
            { name: "Deezer", value: "deezer" },
            { name: "Spotify", value: "spotify" },
          ],
        },
        {
          name: "loop",
          description: "Loop da música?",
          type: 5,
          required: false,
        },
      ],
    },
    {
      name: "minecraft",
      description: "Utilidades de minecraft!",
      options: [
        {
          name: "status",
          description: "Obtém informações básicas de um servidor Minecraft.",
          type: 1,
          options: [
            {
              name: "ip",
              description: "O endereço IP do servidor Minecraft.",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "jogador",
          description: "Obtêm dados básicos de um jogador de Minecraft",
          type: 1,
          options: [
            {
              name: "jogador",
              description: "O jogador de qual deseja obter dados",
              type: 3,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "ajuda",
      description: "Que raios esse bot oferece?",
    },
    {
      name: "freedoms",
      description: "Veja quantas freedoms você tem.",
      options: [
        {
          name: "user",
          description: "O usuário para verificar freedoms.",
          type: 6,
          required: false,
        },
      ],
    },
    {
      name: "daily",
      description: "Colete seu bônus diário de freedoms.",
    },
  ];

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

// Save data to JSON files
function saveData() {
  fs.writeFileSync(freedomsFile, JSON.stringify(freedoms, null, 2));
  fs.writeFileSync(dailyCooldownFile, JSON.stringify(dailyCooldown, null, 2));
}

client.on("messageCreate", async (message) => {
  if (waitingForPrefix) {
    if (message.author.bot) return;

    const guildId = message.guild.id;
    guildPrefixes.set(guildId, message.content);

    waitingForPrefix = false;
    message.reply(
      `O prefixo foi definido como "${message.content}" para este servidor.`,
    );
  }

  const guildPrefix = guildPrefixes.get(message.guild.id) || defaultPrefix;

  if (message.content === guildPrefix + "prefixo") {
    const isOwner = message.member.id === message.guild.fetchOwner().id;
    const hasManageGuildPermission =
      message.member.permissions.has("ManageGuild");

    if (!hasManageGuildPermission || !isOwner) {
      message.reply("❌ Você não tem permissão para usar este comando.");
      return;
    }
    message.reply(
      `Atualmente, o prefixo do Freeless é "${guildPrefix}", e ele pode ser alterado para qualquer outro caractere! Envie uma mensagem com o novo prefixo e eu irei alterar o meu prefixo para ele.`,
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
        `💸 **|** Você recebeu <:freedoms:1282757761406468128> ${dailyFreedoms} <:freedoms:1282757761406468128> freedoms! Agora você tem ${freedoms[userDailyId]} freedoms! 🥇`,
      );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  switch (commandName) {
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
      comandoDailyExecutar(interaction)
      break;
  }
});

client.login(token);