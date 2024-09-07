const express = require("express");
const app = express();

app.listen(3000, () => {
  console.log("O Bot Sem Liberdade foi Preso! Inicialização bem-sucedida");
});

app.get("/", (req, res) => {
  res.send("Freeless Bot - O Bot que se importa");
});

const Discord = require("discord.js");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.login(process.env.token);

client.on("ready", () => {
  console.log(`Bot está online como ${client.user.tag}`);
  client.user.setActivity("falar do novo recurso de IA do @IA Bot, feito por @MigstTOP (com certeza não é uma cópia da Clyde)", { type: "LISTENING" });
  client.on("guildCreate", guild => {
    const owner = guild.owner;
    const embed = new MessageEmbed()
      .setColor("#32CD32")
      .setTitle("Obrigado pela escolha! <3")
      .setDescription("Um simples valeu do criador")
      .addField("Muito Obrigado...", "...Por nos escolher")
      .addField("Eu, Freeless, Sou...", "...Muito Grato pela escolha!")
      .addField("Tentamos sempre melhorar...", "Sempre estamos atualizando o Bot")
      .addField("Para ajuda,", "Digite freeless ?")
      .addField("Nós o agradecemos...", "...Imensamente! :heart_decoration:")
      .setFooter("Divirta-se :wink:");
    owner.send(embed);
    console.log(`Joined a new server: ${guild.name}`);
  });

  client.on("guildDelete", guild => {
    console.log(`Left a server: ${guild.name}`);
  });
});

client.on("messageCreate", message => {
  if (message.content === "freeless ping") {
    const start = Date.now();
    message.channel.send("Calculando ping da internet...").then((sentMessage) => {
      const end = Date.now();
      sentMessage.edit(`Ping da internet: ${end - start}ms`);
    });
  }

  if (message.content.startsWith('freeless repronuncie')) {
    const args = message.content.split(' ');
    if (args.length >= 4) {
      const vezes = parseInt(args[args.length - 2]);
      const texto = args.slice(3, -2).join(' ');

      if (!isNaN(vezes) && vezes > 0) {
        let resposta = (texto + ' ').repeat(vezes);
        message.channel.send(resposta);
      } else {
        message.channel.send('Por favor, forneça um número válido de vezes.');
      }
    } else {
      message.channel.send('Uso correto: "freeless repronuncie (texto) (vezes) vezes"');
    }
  }

  if (message.content.startsWith("freeless ban")) {
    const mention = message.content.split(" ")[2];
    const member = message.mentions.members.first();
    if (member) {
      member.ban();
    }
  }

  if (message.content.startsWith("freeless expulse")) {
    const mention = message.content.split(" ")[2];
    const member = message.mentions.members.first();
    if (member) {
      member.kick();
    }
  }

  if (message.content.startsWith("freeless cargo add")) {
    const args = message.content.split(" ");
    if (args.length === 5) {
      const nome = args[3];
      const cor = args[4];

      if (/^#[0-9A-F]{6}$/i.test(cor)) {
        message.guild.roles.create({
          name: nome,
          color: cor,
        })
        .then((cargo) => {
          message.channel.send(`Cargo "${nome}" adicionado com sucesso!`);
        })
        .catch((error) => {
          console.error(error);
          message.channel.send("Houve um erro ao adicionar o cargo. Certifique-se de que o bot tem as permissões necessárias.");
        });
      } else {
        message.channel.send('A cor deve estar no formato hexadecimal #RRGGBB.');
      }
    } else {
      message.channel.send('Uso correto: "freeless cargo add (nome) (cor)"');
    }
  }

  if (message.content === "freeless ajuda" || message.content === "freeless ?") {
    const embed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Comandos do Bot")
      .setDescription("Aqui estão alguns comandos disponíveis:")
      .addField("Ping", "Calcula o ping da sua internet")
      .addField("Repronuncie", "Repete o que você diz")
      .addField("IA", "Menciona o <@1163931950747234416>")
      .addField("Libertar", "Me faz sair de uma prisão chamada de servidor")
      .addField("Expulse", "Expulsa alguém")
      .addField("Ban", "Bane alguém")
      .setFooter("Para mais informações, consulte a documentação do bot");

    message.channel.send({ embeds: [embed] });
  }
});

client.on("guildMemberRemove", member => {
  const channel = client.channels.cache.get("1162140970914168853");
  channel.send(`Que triste, ${member.user.username} foi embora!`);
});

client.on('guildMemberAdd', member => {
  const welcomeMessages = [
    `Oi, ${member.user.username}, todos aqui são manos!!`,
    `Bom dia, ${member.user.username}, e um bom dia, com muita alegria`,
    `Você conseguiu, ${member.user.username}!`,
  ];

  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  const mensagem = welcomeMessages[randomIndex];

  const channel = member.guild.channels.cache.find((channel) => channel.name === 'geral');
  if (channel) {
    channel.send(mensagem);
  } else {
    const canais = guild.channels.cache.array();
    if (canais.length > 0) {
      const primeiroCanal = canais[0];
      primeiroCanal.send(mensagem);
    }
  }
});

client.on("messageCreate", message => {
  if (message.content === 'freeless convite') {
    const inviteLink = "https://discord.com/api/oauth2/authorize?client_id=911646421441187931&permissions=8&scope=bot";
    const response = `Claro! [Clique aqui para convidar o bot](${inviteLink})`;
    message.channel.send(response);
  }
});

client.on("messageCreate", async message => {
  if (message.content.startsWith("freeless mídia")) {
    const args = message.content.split(" ");
    if (args.length === 3) {
      const channelMention = args[2];
      const matches = channelMention.match(/<#(\d+)>/);
      if (matches) {
        const channelID = matches[1];
        const mediaChannel = message.guild.channels.cache.get(channelID);
        if (mediaChannel) {
          // Reply with an ephemeral message
          message.reply({ content: `Canal ${mediaChannel} agora está restrito a envio de apenas mídia.`, ephemeral: true });
        } else {
          // Reply with an ephemeral message
          message.reply({ content: "Canal não encontrado. Verifique o canal mencionado.", ephemeral: true });
        }
      } else {
        // Reply with an ephemeral message
        message.reply({ content: "Formato de menção de canal inválido. Use a menção do canal, por exemplo, #canal.", ephemeral: true });
      }
    } else {
      // Reply with an ephemeral message
      message.reply({ content: 'Uso correto: "freeless mídia #canal"', ephemeral: true });
    }
  } else {
    // Attempt to delete the text message (wrapped in a try-catch)
    try {
      await message.delete();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }
});