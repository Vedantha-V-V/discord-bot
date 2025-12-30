// Importing modules using ES6 syntax
import { SlashCommandBuilder } from 'discord.js';

// Command Builder export
export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Instructions of how the bot can help you.');

// Execute function export
export async function execute(interaction) {
  const message='Hi this is your Events Manager Bot and for any update, type in natural language and get the desired output.\nAvailable functions:\n- Get all Events\n- Get an Event by date\n- Update an Event\n- Add an Event\n- Delete Events'
  await interaction.reply(message);
}