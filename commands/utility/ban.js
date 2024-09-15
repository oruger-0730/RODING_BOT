const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('指定したユーザーをBANします')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('BANするユーザーを指定してください')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('BANの理由を入力してください')
        .setRequired(false)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '理由なし';
    
    // BAN権限のチェック
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      const noPermissionEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('エラー')
        .setDescription('BAN権限がありません。')
        .setTimestamp();

      return interaction.reply({ embeds: [noPermissionEmbed], ephemeral: true }); // 他のユーザーには見えない形で返信
    }

    const member = interaction.guild.members.cache.get(targetUser.id);

    // BANするユーザーがサーバーにいるか確認
    if (!member) {
      const noMemberEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('エラー')
        .setDescription('そのユーザーはこのサーバーにいません。')
        .setTimestamp();

      return interaction.reply({ embeds: [noMemberEmbed], ephemeral: true });
    }

    try {
      await member.ban({ reason });

      const successEmbed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('ユーザーをBANしました')
        .setDescription(`**${targetUser.tag}** がBANされました。\n理由: ${reason}`)
        .setTimestamp();

      return interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('BANエラー:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('エラー')
        .setDescription('ユーザーをBANできませんでした。')
        .setTimestamp();

      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
};
