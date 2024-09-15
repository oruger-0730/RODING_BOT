const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('ボットの遅延を確認します。'),

    async execute(interaction) {
        if (!interaction.isCommand()) {
            return interaction.reply({ content: 'このコマンドはインタラクションでのみ使用できます。', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('Ping')
            .setDescription('Ping を計測しています...')
            .setColor('Blue');

        const sentMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        const pingEmbed = new EmbedBuilder()
            .setTitle('Ping 結果')
            .setDescription(`ボットの遅延は ${sentMessage.createdTimestamp - interaction.createdTimestamp}ms です。`)
            .setColor('Green');

        await sentMessage.edit({ embeds: [pingEmbed] });
    },
};
