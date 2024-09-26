import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import playDl from 'play-dl'
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';

dotenv.config();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.spotifyId,
  clientSecret: process.env.spotifySecret,
  redirectUri: "http://localhost:3000/callback"
});

spotifyApi.clientCredentialsGrant().then(
  function (data) {
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function (err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);

const queue = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const serverQueue = queue.get(newState.guild.id);

  if (serverQueue && newState.member.user.id === client.user.id && !newState.channelId) {
    const kickedMessage = 'Fui expulso do canal de voz 😭';
    serverQueue.textChannel.send(kickedMessage);
    queue.delete(newState.guild.id);
  }
});

async function comandoTocarExecutar(interaction, options) {
  const searchTerm = options.getString('dados');
  const plataforma = options.getString('plataforma') || 'spotify';
  const member = interaction.guild.members.cache.get(interaction.user.id) || interaction.member;
  const voiceChannel = member?.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({ content: '⛔ Você precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
  }

  const serverQueue = queue.get(interaction.guildId);
  const songInfo = await getSongInfo(searchTerm, plataforma);

  if (!songInfo) {
    return interaction.reply({ content: '😔 Não foi possível encontrar a música desejada', ephemeral: true });
  }

  const song = {
    title: songInfo.title,
    url: songInfo.url,
  };

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: interaction.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(interaction.guildId, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true
      });

      queueConstruct.connection = connection;
      await interaction.reply(`🎶 Adicionando à fila: **${song.title}**`);
      play(interaction, interaction.guild, queueConstruct.songs[0], plataforma);
    } catch (error) {
      queue.delete(interaction.guildId);
      console.error(error);
      return interaction.reply({ content: '😔 Ocorreu um erro ao entrar no canal de voz', ephemeral: true });
    }
  } else {
    serverQueue.songs.push(song);
    await interaction.reply(`🎶 Adicionado à fila: **${song.title}**`);
  }
}

async function play(interaction, guild, song, plataforma) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const connection = getVoiceConnection(guild.id);
  const stream = await playDl.stream(song.url).catch(err => {
    console.error("Error streaming the song:", err);
    return null;
  });

  if (!stream) {
    return interaction.reply({ content: 'Ocorreu um erro ao tentar reproduzir a música. Tente novamente mais tarde.', ephemeral: true });
  }

  const resource = createAudioResource(stream.stream, { inputType: stream.type });
  const player = createAudioPlayer();

  player.play(resource);
  connection.subscribe(player);

  player.on('stateChange', async (oldState, newState) => {
    if (newState.status === 'playing' && oldState.status !== 'playing') {
      const embedTitle = plataforma === 'spotify' 
        ? `<:spotify_representer:1182710377881030767> Comecei a tocar **${song.title}**`
        : `<:youtube_representer:1182710083180834877> Comecei a tocar **${song.title}**`;

      const startedPlaying = new EmbedBuilder({
        title: embedTitle,
        color: 0x585656,
      });

      await interaction.followUp({ embeds: [startedPlaying] });
    }

    if (newState.status === 'idle') {
      serverQueue.songs.shift();
      play(interaction, guild, serverQueue.songs[0], plataforma);
    }
  });
}

async function getSongInfo(searchTerm, plataforma) {
  try {
    if (plataforma === 'spotify') {
      const response = await spotifyApi.searchTracks(searchTerm);
      const tracks = response.body.tracks.items;

      if (tracks.length > 0) {
        const trackInfo = tracks[0];
        return {
          title: trackInfo.name,
          url: trackInfo.external_urls.spotify,
        };
      }
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { comandoTocarExecutar };