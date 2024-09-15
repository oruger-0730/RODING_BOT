const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '/coins.json');

const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(data);
};

const saveData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('管理者コマンド')
    .addSubcommand(subcommand =>
      subcommand
        .setName('reload')
        .setDescription('Botを再起動します'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('money')
        .setDescription('指定したユーザーのお金を管理します')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('お金を管理する対象のユーザー')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('変更するお金の額')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('operation')
            .setDescription('操作の種類')
            .setRequired(true)
            .addChoices(
              { name: 'add', value: 'add' },
              { name: 'remove', value: 'remove' },
              { name: 'set', value: 'set' }
            )
        )
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'reload') {
      // コマンドを実行したユーザーが管理者であるか確認
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('エラー')
          .setDescription('このコマンドを実行する権限がありません。')
          .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('再起動')
        .setDescription('Botを再起動します...')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      process.exit(0); // プロセスの終了
    }

    if (interaction.options.getSubcommand() === 'money') {
      // コマンドを実行したユーザーが管理者であるか確認
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('エラー')
          .setDescription('このコマンドを実行する権限がありません。')
          .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const targetUser = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');
      const operation = interaction.options.getString('operation');

      let data = readData();
      if (!data[targetUser.id]) {
        data[targetUser.id] = 0;
      }

      if (operation === 'add') {
        data[targetUser.id] += amount;
      } else if (operation === 'remove') {
        data[targetUser.id] = Math.max(0, data[targetUser.id] - amount);
      } else if (operation === 'set') {
        data[targetUser.id] = amount;
      }

      saveData(data);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('お金の操作成功')
        .setDescription(`${targetUser.username} のお金を ${operation} 操作しました。現在の金額: ${data[targetUser.id]}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};
