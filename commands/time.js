// Importing modules using ES6 syntax
import { SlashCommandBuilder } from 'discord.js';

// Command Builder export
export const data = new SlashCommandBuilder()
  .setName('time')
  .setDescription('The bot will give you the exact time.');

// Execute function export
export async function execute(interaction) {
    const date = new Date().toString().split(" ")
    const time=date[4]
  await interaction.reply(time);
}