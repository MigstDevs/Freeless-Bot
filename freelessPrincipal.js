// Imports de arquivo
import { comandoTocarExecutar } from './comandos/tocar.js';
import { comandoPingExecutar } from './comandos/ping.js';
import { comandoConviteExecutar } from './comandos/convite.js';
import { comandoMinecraftExecutar } from './comandos/minecraft.js';
import { comandoAjudaExecutar } from './comandos/ajuda.js';
import { comandoMídiaExecutar } from './comandos/mídia.js';

// Imports de bibliotecas ou pacotes
import { Client, GatewayIntentBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import express from 'express';

const app = express();

let defaultPrefix = "fl!";
let guildPrefixes = new Map();
let waitingForPrefix = false;

let commandHistory = [];

const token = process.env.token;
const clientId = '911646421441187931';

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

const rest = new REST({ version: '10' }).setToken(token);

client.on('ready', async () => {
  console.log(`O Freeless tá online como ${client.user.tag}`);
  client.user.setActivity("falar de que você recebe ajuda ao executar /ajuda", { type: "LISTENING" });

  const commands = [
    {
      name: 'ping',
      description: 'Calcula o ping de ambas nossas internets',
    },
    {
      name: 'convite',
      description: 'Obtêm o link de convite do bot.',
    },
    {
      name: 'mídia',
      description: 'Restringe um canal para apenas upload de mídia',
      options: [
        {
          name: 'canal',
          description: 'Canal para restringir',
          type: 7,
          required: true,
        },
      ],
    },
    {
      name: 'tocar',
      description: 'Toca uma música no canal de voz.',
      options: [
        {
          name: 'dados',
          description: 'A URL ou termo de pesquisa da música.',
          type: 3,
          required: true,
        },
        {
          name: 'plataforma',
          description: 'A plataforma da qual buscar a música.',
          type: 3,
          required: false,
          choices: [
            { name: 'YouTube', value: 'youtube' },
            { name: 'Deezer', value: 'deezer' },
            { name: 'Spotify', value: 'spotify' },
          ],
        },
        {
          name: 'loop',
          description: 'Loop da música?',
          type: 5,
          required: false,
        },
      ],
    },
    {
      name: 'minecraft',
      description: 'Utilidades de minecraft!',
      options: [
        {
          name: 'status',
          description: 'Obtém informações básicas de um servidor Minecraft.',
          type: 1,
          options: [
            {
              name: 'ip',
              description: 'O endereço IP do servidor Minecraft.',
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: 'jogador',
          description: 'Obtêm dados básicos de um jogador de Minecraft',
          type: 1,
          options: [
            {
              name: 'jogador',
              description: 'O jogador de qual deseja obter dados',
              type: 3,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'ajuda',
      description: 'Que raios esse bot oferece?',
    },
  ];

  try {
    console.log('Comecei a atualizar os comandos barra.');

    rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log('Terminei de atualizar os comandos barra.');
  } catch (error) {
    console.error(error);
  }
});

client.on('messageCreate', async message => {
  if (waitingForPrefix) {
    if (message.author.bot) return;

    const guildId = message.guild.id;
    guildPrefixes.set(guildId, message.content);

    waitingForPrefix = false;
    message.reply(`O prefixo foi definido como "${message.content}" para este servidor.`);
  }

  if (message.content === "<@911646421441187931>") {
    message.reply("Olá! Eu sou o Freeless, o bot que é seu escravo! 🫡 Para saber mais sobre mim, use </ajuda:1177690363629146222>");
  }

  const guildPrefix = guildPrefixes.get(message.guild.id) || defaultPrefix;

  if (message.content === guildPrefix + "prefixo") {
    const isOwner = message.member.id === message.guild.fetchOwner().id;
    const hasManageGuildPermission = message.member.permissions.has('ManageGuild');
    
    if (!hasManageGuildPermission || !isOwner) {
      message.reply("❌ Você não tem permissão para usar este comando.");
      return;
    }
    message.reply(`Atualmente, o prefixo do Freeless é "${guildPrefix}", e ele pode ser alterado para qualquer outro caractere! Envie uma mensagem com o novo prefixo e eu irei alterar o meu prefixo para ele.`);
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
        content: 'O que deseja depurar?',
        components: [
          {
            type: 1,
            components: [
              {
                type: 3,
                custom_id: 'debug_menu',
                options,
                placeholder: '(Comando ainda está em desenvolvimento)',
              },
            ],
          },
        ],
      });
    } else {
      message.reply("Quem você acha que é? Bom, o <@911000689365381130> não é! O <@911000689365381130> é o dono do Freeless, e este comando seria muito perigoso se acessável para todos! Espero que entenda!\n\nEsta mensagem será deletada em 15 segundos, fui! 😉").then(replyMessage => {
        setTimeout(() => {
          replyMessage.delete().catch(error => console.error(`Error deleting message: ${error}`));
        }, 15000);
      });
    }
  }

  // Log executed commands
  if (message.content.startsWith(guildPrefix)) {
    
    if (waitingForPrefix) return;
    
    commandHistory.push(`Message Command - ${message.author.displayName} [${message.author.username}]: ${message.content}`);
    if (commandHistory.length > 10000) {
      commandHistory.shift(); 
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isStringSelectMenu()) {
    const selectedOption = interaction.values[0];

    if (selectedOption === 'veri_ativi') {
      const embed = {
        color: 0x0099ff,
        title: 'Últimos Comandos 📒',
        fields: [
          {
            name: '**Detalhes**',
            value: commandHistory.join('\n\n'),
          },
        ],
      };
      if (interaction.user.id === "911000689365381130") await interaction.reply({ embeds: [embed] });
      else await interaction.reply("Você não tem permissão para usar este comando.");
    } else if (selectedOption === 'reiniciar_bot') {
      if (interaction.user.id === "911000689365381130") {
        await interaction.reply("🔄️ ⛔ Reiniciando o Freeless...");
        client.destroy();
        console.log("Freeless Desligado.");
        client.login(token);
        console.log("Freeless Iniciado: Reinicialização Bem-Sucedida.");
        await interaction.channel.send("👍 Reinicialização Bem-Sucedida!")
      } else await interaction.reply("Você não tem permissão para usar este comando.");
    }
  } else if (interaction.isCommand()) {
    // Log executed slash commands
    const { commandName, options } = interaction;
    commandHistory.push(`Slash Command - ${interaction.user.displayName} [${interaction.user.username}]: ${commandName} ${options ? JSON.stringify(options) : ''}`);
    if (commandHistory.length > 10000) {
      commandHistory.shift();
    }

    
    switch (commandName) {
      case 'ping':
        comandoPingExecutar(interaction);
        break;
      case 'convite':
        comandoConviteExecutar(interaction);
        break;
      case 'mídia':
        comandoMídiaExecutar(interaction, options);
        break;
      case 'tocar':
        comandoTocarExecutar(interaction, options);
        break;
      case 'minecraft':
        comandoMinecraftExecutar(interaction, options);
        break;
      case 'ajuda':
        comandoAjudaExecutar(interaction);
        break;
    }
  }
});

client.login(token);