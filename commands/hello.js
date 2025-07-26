// Importing modules using ES6 syntax
import { SlashCommandBuilder } from 'discord.js';

// Command Builder export
export const data = new SlashCommandBuilder()
  .setName('hello')
  .setDescription('The bot will say hello!');

// Execute function export
export async function execute(interaction) {
  await interaction.reply('Hello!');
}