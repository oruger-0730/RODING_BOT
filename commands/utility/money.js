const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ファイルパス
const dataFilePath = path.join(__dirname, '/coins.json');
const itemsFilePath = path.join(__dirname, '/userItems.json');

// コインデータを読み込む関数
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(data);
};

// アイテムデータを読み込む関数
const readItemsData = () => {
  if (!fs.existsSync(itemsFilePath)) {
    fs.writeFileSync(itemsFilePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(itemsFilePath, 'utf-8');
  return JSON.parse(data);
};

// /money item コマンド
const moneyItem = async (interaction) => {
  const targetUser = interaction.options.getUser('user') || interaction.user;
  const data = readData();
  const itemsData = readItemsData();

  const userId = targetUser.id;

  const coins = data[userId] || 0;
  const items = itemsData[userId] || [];

  const embed = new EmbedBuilder()
      .setColor('Blue')
      .setTitle(`${targetUser.username}のステータス`)
      .setDescription(`コイン: ${coins}\nアイテム: ${items.length > 0 ? items.join(', ') : 'アイテムなし'}`)
      .setTimestamp();

  await interaction.reply({ embeds: [embed] });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('money')
    .setDescription('コインを獲得するためのコマンド')
    .addSubcommand(subcommand =>
      subcommand
        .setName('work')
        .setDescription('お仕事をしてコインを獲得します'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('crime')
        .setDescription('犯罪をしてコインを獲得します'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('slut')
        .setDescription('スラットとしてコインを獲得します'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('item')
        .setDescription('指定した人のお金とアイテムリストを表示します')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('ステータスを確認するユーザーを指定します'))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'work') {
      await moneyWork(interaction);
    } else if (subcommand === 'crime') {
      await moneyCrime(interaction);
    } else if (subcommand === 'slut') {
      await moneySlut(interaction);
    } else if (subcommand === 'item') {
      await moneyItem(interaction);
    }
  }
};
