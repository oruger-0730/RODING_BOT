const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!と返事します。'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};