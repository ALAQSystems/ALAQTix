require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');

// Load configuration
const config = require('../config.json');
const token = process.env.DISCORD_TOKEN;

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Slash commands
const commands = [
  new SlashCommandBuilder().setName('setup').setDescription('Set up the support ticket system'),
  new SlashCommandBuilder().setName('premium').setDescription('Get the link to Patreon for premium features'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

// Register commands
(async () => {
  try {
    console.log('Refreshing application (/) commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Bot ready
client.once('ready', () => {
  console.log('ALAQMail is online and ready to assist!');
});

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'setup') {
    const setupEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Support Ticket System Setup')
      .setDescription('The ticket system setup is complete! The ticket panel will now be posted.');

    await interaction.reply({ embeds: [setupEmbed], ephemeral: true });

    const ticketPanelEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎟️ Open a Support Ticket')
      .setDescription('Select a ticket type from the dropdown menu below to get started.')
      .setFooter({ text: 'ALAQMail - Your Futuristic Ticket System' });

    const ticketMenu = new StringSelectMenuBuilder()
      .setCustomId('ticketMenu')
      .setPlaceholder('Select a ticket type...')
      .addOptions(
        config.reactionPanels.map((panel) => ({
          label: panel.topic,
          description: `Open a ticket for ${panel.topic}`,
          value: panel.emoji,
        }))
      );

    const row = new ActionRowBuilder().addComponents(ticketMenu);
    const ticketEmbedChannel = client.channels.cache.get(config.ticketEmbedChannelId);

    if (ticketEmbedChannel) {
      await ticketEmbedChannel.send({
        embeds: [ticketPanelEmbed],
        components: [row],
      });
    }
  }

  if (commandName === 'premium') {
    const premiumEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('Premium Features')
      .setDescription('Support us on Patreon to unlock premium features!')
      .setURL('https://www.patreon.com/yourpatreon')
      .setFooter({ text: 'Thank you for your support!' });

    await interaction.reply({ embeds: [premiumEmbed], ephemeral: true });
  }
});

// Ticket system logic (include your ticket creation and management code here)
// This includes handling dropdown interactions, ticket creation, claiming, and closing.

// Login to Discord
client.login(token);
