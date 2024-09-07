import Discord from 'discord.js';

const { Client, GatewayIntentBits, EmbedBuilder, PermissionsString } = Discord;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function comandoMídiaExecutar (interaction, options) {
  const channel = options.getChannel('canal');
  let restriction = {
    channelRestricted: channel,
    value: false,
  };
  
  const awnserEmbed = new EmbedBuilder({
    title: `O Canal ${channel.name}`,
    description: 'foi restringido a mídia',
    color: 0xADEAFF,
    thumbnail: {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4gqg4M5o3NKMyEu3PGQyIcq1lqJRUSRVPe1Kv2zFC45BYWXZAnAo3dK77lFcLF7btj9k&usqp=CAU",
    },
  });
  
  if (channel) {
    if (channel.type !== 0) {
      await interaction.reply({ content: '🔊 O canal selecionado não é um canal de texto.', ephemeral: true });
    } 
    
    const isOwner = interaction.member.id === interaction.guild.ownerId;
    const hasManageChannelsPermission = interaction.member.permissions.has('ManageChannels');
    
     if (!hasManageChannelsPermission || !isOwner) {
       await interaction.reply({ content: '❌ Você não tem as permissões necessárias (**Gerenciar canais**) para usar este comando', ephemeral: true });
     }
    
      if (channel) {
        if (!restriction.value && !restriction.channelRestricted === channel) {
          await interaction.reply( { embeds: [awnserEmbed] } );
          restriction.channelRestricted = channel;
          restriction.value = true;

          client.on('messageCreate', message => {
            if (message.channel.id === channel.id) {
              if (!message.attachments.size > 0) {
                const writer = message.author;
                message.delete();
                writer.send(`❌ Você tentou enviar uma mensagem sem mídia em um canal de mídia (<#${channel.id}>) do servidor ${message.guild.name}. 🗑 A mensagem foi deletada!`);
              }
            }
          });
        }
      } else {
        await interaction.reply({ content: "❌ Canal não encontrado. Verifique o canal.", ephemeral: true });
      }
  }
  if (restriction.value && restriction.channelRestricted === channel) {
    const reply = await interaction.reply({ content: "❌ Este canal já está restringido a mídia. Você deseja remover essas restrições?", ephemeral: true });
    
    reply();
    
    reply.react('✅');

    const filter = (reaction, user) => {
      return ['✅'].includes(reaction.emoji.name);
    };

    const collector = reply.createReactionCollector(filter, { time: 60000 });

    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name === '✅') {
        restriction.value = false;
        restriction.channelRestricted = null;
        reply.edit({ content: "✅ As restrições de mídia foram removidas.", ephemeral: true})
      }
    });
  }
  };

export { comandoMídiaExecutar };