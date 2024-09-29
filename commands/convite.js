import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

async function comandoConviteExecutar(interaction) {
  const inviteLink = "https://discord.com/api/oauth2/authorize?client_id=911646421441187931&permissions=8&scope=bot";
  const inviteMessage = `Claro! [Clique aqui para convidar o bot](${inviteLink})`;
  interaction.reply({ content: inviteMessage, ephemeral: true });
}

export { comandoConviteExecutar };