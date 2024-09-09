// Imports de arquivo
import { comandoTocarExecutar } from "./comandos/tocar.js";
import { comandoPingExecutar } from "./comandos/ping.js";
import { comandoConviteExecutar } from "./comandos/convite.js";
import { comandoMinecraftExecutar } from "./comandos/minecraft.js";
import { comandoAjudaExecutar } from "./comandos/ajuda.js";

// Imports de bibliotecas ou pacotes
import { Client, GatewayIntentBits } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import express from "express";

const app = express();

let defaultPrefix = "fl!";
let guildPrefixes = new Map();
let waitingForPrefix = false;

let commandHistory = [];
let freedoms = new Map(); // Store freedoms for each user
let dailyCooldown = new Map(); // Track daily command cooldowns

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
  client.user.setActivity("falar de que você recebe ajuda ao executar /ajuda", {
    type: "LISTENING",
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
      description: "Verifique a sua quantidade de freedoms.",
      options: [
        {
          name: "user",
          description: "Usuário para verificar a quantidade de freedoms.",
          type: 6, // User mention type
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

    rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Terminei de atualizar os comandos barra.");
  } catch (error) {
    console.error(error);
  }
});

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

  if (message.content === "<@911646421441187931>") {
    message.reply(
      "Olá! Eu sou o Freeless, o bot que é seu escravo! 🫡 Para saber mais sobre mim, use </ajuda:1177690363629146222>",
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

  if (message.content === guildPrefix + "debug") {
    if (message.author.id === "911000689365381130") {
      const options = [
        {
          label: `Verificar atividade do bot`,
          value: `veri_ativi`,
        },
        {
          label: `Reiniciar o Bot`,
          value: `reiniciar_bot`,
        },
      ];

      message.reply({
        content: "O que deseja depurar?",
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: "debug_menu",
                options,
                placeholder: "(Comando ainda está em desenvolvimento)",
              },
            ],
          },
        ],
      });
    } else {
      message
        .reply(
          "Quem você acha que é? Bom, o <@911000689365381130> não é! O <@911000689365381130> é o dono do Freeless, e este comando seria muito perigoso se acessável para todos! Espero que entenda!\n\nEsta mensagem será deletada em 15 segundos, fui! 😉",
        )
        .then((replyMessage) => {
          setTimeout(() => {
            replyMessage
              .delete()
              .catch((error) =>
                console.error(`Error deleting message: ${error}`),
              );
          }, 15000);
        });
    }
  }

  // Log executed commands
  if (message.content.startsWith(guildPrefix)) {
    if (waitingForPrefix) return;

    commandHistory.push(
      `Message Command - ${message.author.displayName} [${message.author.username}]: ${message.content}`,
    );
    if (commandHistory.length > 10000) {
      commandHistory.shift();
    }
  }

  // Handle text commands for freedoms and daily
  if (message.content.startsWith(guildPrefix + "freedoms")) {
    const mentionedUser = message.mentions.users.first();
    const userId = mentionedUser ? mentionedUser.id : message.author.id;
    const userFreedoms = freedoms.get(userId) || 0;

    if (mentionedUser) {
      message.reply(`<@${userId}> tem ${userFreedoms} freedoms!`);
    } else {
      message.reply(`Você tem ${userFreedoms} freedoms!`);
    }
  }

  if (message.content.startsWith(guildPrefix + "daily")) {
    const userId = message.author.id;
    const now = Date.now();
    const lastDaily = dailyCooldown.get(userId);
    const currentDate = new Date(now).getDate();
    const lastDailyDate = lastDaily ? new Date(lastDaily).getDate() : -1;

    if (lastDaily && currentDate === lastDailyDate) {
      message.reply(
        `<@${userId}>, você já coletou seu bônus diário hoje!`,
      );
    } else {
      const dailyFreedoms = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
      const userFreedoms = freedoms.get(userId) || 0;
      freedoms.set(userId, userFreedoms + dailyFreedoms);
      dailyCooldown.set(userId, now);
      message.reply(
        `<@${userId}> você recebeu ${dailyFreedoms} freedoms! Agora você tem ${userFreedoms + dailyFreedoms} freedoms!`,
      );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
    if (commandName === "convite") {
    comandoConviteExecutar(interaction);
  } else if (commandName === "tocar") {
    comandoTocarExecutar(interaction);
  } else if (commandName === "minecraft") {
    comandoMinecraftExecutar(interaction);
  } else if (commandName === "ajuda") {
    comandoAjudaExecutar(interaction);
  } else if (commandName === "freedoms") {
    const user = options.getUser("user") || interaction.user;
    const userId = user.id;
    const userFreedoms = freedoms.get(userId) || 0;
    await interaction.reply(`<@${userId}> tem ${userFreedoms} freedoms!`);
  } else if (commandName === "daily") {
    const userId = interaction.user.id;
    const now = Date.now();
    const lastDaily = dailyCooldown.get(userId);
    const currentDate = new Date(now).getDate();
    const lastDailyDate = lastDaily ? new Date(lastDaily).getDate() : -1;

    if (lastDaily && currentDate === lastDailyDate) {
      await interaction.reply(
        `<@${userId}>, você já coletou seu bônus diário hoje!`,
      );
    } else {
      const dailyFreedoms = Math.floor(Math.random() * (5000 - 1500 + 1)) + 1500;
      const userFreedoms = freedoms.get(userId) || 0;
      freedoms.set(userId, userFreedoms + dailyFreedoms);
      dailyCooldown.set(userId, now);
      await interaction.reply(
        `<@${userId}> você recebeu ${dailyFreedoms} freedoms! Agora você tem ${userFreedoms + dailyFreedoms} freedoms!`,
      );
    }
  }
});

client.login(token);