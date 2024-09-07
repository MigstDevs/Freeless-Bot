import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, getVoiceConnection } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';
import playDl from 'play-dl';
import SpotifyWebApi from 'spotify-web-api-node';
const { fetch } = playDl;

const spotifyApi = new SpotifyWebApi({
  clientId: 'b71869a82e614ab2bac3c45d63128f7d',
  clientSecret: '8f845f3a83f249278b671e1c23a8dfd9',
  redirectUri: 'http://localhost:3000/callback',
});

const queue = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
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

 async function comandoTocarExecutar (interaction, options)  {
  console.log(options);
  const searchTerm = options.getString('dados');
  const plataforma = options.getString('plataforma') || 'youtube'; 
  const voiceChannel = interaction.member?.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({ content: '⛔ Você precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
  }

  const serverQueue = queue.get(interaction.guildId);

  const songInfo = await getSongInfo(searchTerm, plataforma);

  if (!songInfo) {
    return interaction.reply({ content: 'Não foi possível encontrar a música desejada 😔', ephemeral: true });
  }

  const loopOption = options.getBoolean('loop') || false;

  const song = {
    title: songInfo.title,
    url: songInfo.url,
    loop: loopOption,
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: interaction.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
      loop: loopOption,
    };

    queue.set(interaction.guildId, queueContruct);

    queueContruct.songs.push(song);

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true
      });
      
      queueContruct.connection = connection;
      play(interaction, interaction.guild, queueContruct.songs[0], plataforma);
    } catch (error) {
      queue.delete(interaction.guildId);
      console.error(error);
      return interaction.reply({ content: 'Ocorreu um erro ao entrar no canal de voz 😔', ephemeral: true });
    }
  } else {
    serverQueue.songs.push(song);
    const nowPlayingMessage = `Adicionado à fila: **${song.title}**`;

    await interaction.reply(nowPlayingMessage);
  }
}

async function play(interaction, guild, song, options) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    if (!serverQueue.loop) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    } else {
      serverQueue.songs.push(serverQueue.songs[0]);
    }
  }

  const connection = getVoiceConnection(guild.id);

  const stream = ytdl(song.url, { filter: 'audioonly' });
  const resource = createAudioResource(stream);

  const player = createAudioPlayer();
  player.play(resource);

  connection.subscribe(player);

  player.on('stateChange', async (oldState, newState) => {
    if (newState.status === 'playing' && oldState.status !== 'playing') {
      if (!interaction.deferred && !interaction.replied) {
        let shouldAwnser;
        if (serverQueue.loop) {
          shouldAwnser = false;
        } else {
          shouldAwnser = true;
        }
        const plataforma = options.getString('plataforma') || 'youtube';

        let EmbedTitle = `:youtube_representer: Comecei a tocar **${song.title}**`;

        if (plataforma === 'spotify') EmbedTitle = `:spotify_representer: Comecei a tocar **${song.title}**`;
        else if (plataforma === 'deezer') EmbedTitle = `:deezer_representer: Comecei a tocar **${song.title}**`;

        const startedPlaying = new EmbedBuilder({
          title: EmbedTitle,
          color: 0x585656,
        });

        if (shouldAwnser) await interaction.reply({ embeds: [startedPlaying]});

    if (newState.status === 'idle') {
      if (!serverQueue.loop) {
        serverQueue.songs.shift();
      }
      play(interaction, guild, serverQueue.songs[0], plataforma);
    }
  }
}
});
};

async function getSongInfo(searchTerm, plataforma) {
  try {
    let videoResult;

    if (plataforma === 'deezer') {
      videoResult = await searchDeezer(searchTerm);
    } else if (plataforma === 'spotify') {
      videoResult = await searchSpotify(searchTerm);
    } else if (plataforma === 'youtube') {
      videoResult = await ytSearch(searchTerm);
    }

    if (!videoResult || !videoResult.videos.length) return null;

    const songInfo = {
      title: videoResult.videos[0].title,
      url: videoResult.videos[0].url,
    };

    return songInfo;
  } catch (error) {
    console.error(error);
    return null;
  }
};

async function searchDeezer(searchTerm) {
    try {
      const data = await fetch(searchTerm, { source: 'deezer' });

      if (data && data.length > 0) {
        const firstResult = data[0];

        return {
          videos: [{
            title: firstResult.title,
            url: firstResult.url,
          }],
        };
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

async function searchSpotify(searchTerm) {
    try {
      const response = await spotifyApi.searchTracks(searchTerm);
      const tracks = response.body.tracks.items;

      if (tracks.length > 0) {
        const trackInfo = tracks[0];

        return {
          videos: [{
            title: trackInfo.name,
            url: trackInfo.external_urls.spotify,
          }],
        };
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
export { comandoTocarExecutar };