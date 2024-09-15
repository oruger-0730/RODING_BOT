const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// データファイルのパス
const coinsFilePath = path.join(__dirname, '/coins.json');
const itemsFilePath = path.join(__dirname, '/items.json');
const userItemsFilePath = path.join(__dirname, '/userItems.json'); // ユーザーアイテムデータのファイルパス

// データの読み込みと書き込み
const readData = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// 管理者権限のチェック
const isAdmin = (user) => {
  const adminRoleId = '1275259533052215378'; // 管理者役割のIDを指定
  return user.roles.cache.has(adminRoleId);
};

// アイテムのランキング表示
const leaderboardItem = (interaction, itemName) => {
  const userItemsData = readData(userItemsFilePath);
  const itemsData = readData(itemsFilePath);

  if (!itemsData[itemName]) {
    return interaction.reply({ content: 'そのアイテムは存在しません。' });
  }

  const leaderboard = [];
  for (const userId in userItemsData) {
    if (userItemsData[userId][itemName]) {
      leaderboard.push({ userId, count: userItemsData[userId][itemName] });
    }
  }

  // ランキングのソート
  leaderboard.sort((a, b) => b.count - a.count);

  if (leaderboard.length === 0) {
    return interaction.reply({ content: 'このアイテムのランキングはありません。' });
  }

  // ランキングの表示
  const embed = new EmbedBuilder()
    .setColor('Blue')
    .setTitle(`${itemName} のランキング`)
    .setDescription(leaderboard.map((entry, index) => `${index + 1}. <@${entry.userId}>: ${entry.count} 個`).join('\n'))
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};

// アイテムの作成
const createItem = (interaction, itemName, itemPrice) => {
  const itemsData = readData(itemsFilePath);

  if (itemsData[itemName]) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('エラー')
      .setDescription(`アイテム「${itemName}」は既に存在します。`)
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  itemsData[itemName] = itemPrice;
  writeData(itemsFilePath, itemsData);

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('アイテム作成')
    .setDescription(`アイテム「${itemName}」を ${itemPrice} コインで作成しました。`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};

// アイテムの削除
const deleteItem = (interaction, itemName) => {
  const itemsData = readData(itemsFilePath);

  if (!itemsData[itemName]) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('エラー')
      .setDescription('そのアイテムは存在しません。')
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  delete itemsData[itemName];
  writeData(itemsFilePath, itemsData);

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('アイテム削除')
    .setDescription(`アイテム「${itemName}」を削除しました。`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};

// アイテムのリセット
const resetItem = (interaction, itemName) => {
  const itemsData = readData(itemsFilePath);
  const userItemsData = readData(userItemsFilePath);

  if (!itemsData[itemName]) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('エラー')
      .setDescription('そのアイテムは存在しません。')
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  for (const userId in userItemsData) {
    userItemsData[userId][itemName] = 0;
  }
  writeData(userItemsFilePath, userItemsData);

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('アイテムリセット')
    .setDescription(`アイテム「${itemName}」を全員0にリセットしました。`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};

// アイテムの情報表示
const infoItem = (interaction, itemName) => {
  const itemsData = readData(itemsFilePath);

  if (!itemsData[itemName]) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('エラー')
      .setDescription('そのアイテムは存在しません。')
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setColor('Blue')
    .setTitle('アイテム情報')
    .setDescription(`アイテム名: ${itemName}\n価格: ${itemsData[itemName]} コイン`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};

// アイテムの購入
const buyItem = async (interaction, itemName, quantity) => {
  const itemsData = readData(itemsFilePath);
  const coinsData = readData(coinsFilePath);
  const userItemsData = readData(userItemsFilePath);
  const userId = interaction.user.id;

  if (!itemsData[itemName]) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('エラー')
      .setDescription('そのアイテムは存在しません。')
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  const itemPrice = itemsData[itemName];
  const totalPrice = itemPrice * quantity;

  if (!coinsData[userId] || coinsData[userId] < totalPrice) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('エラー')
      .setDescription('コインが不足しています。')
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }

  // アイテムの購入処理
  coinsData[userId] -= totalPrice;
  if (!userItemsData[userId]) userItemsData[userId] = {};
  userItemsData[userId][itemName] = (userItemsData[userId][itemName] || 0) + quantity;
  writeData(coinsFilePath, coinsData);
  writeData(userItemsFilePath, userItemsData);

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('購入完了')
    .setDescription(`アイテム「${itemName}」を ${quantity} 個購入しました。残りのコイン: ${coinsData[userId]} コイン`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
};

// コマンド処理
module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('アイテムの管理を行います')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('アイテムを作成します')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('アイテム名')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('price')
            .setDescription('アイテムの値段')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('アイテムを削除します')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('削除するアイテム名')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('アイテムのコインを全員0にリセットします')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('リセットするアイテム名')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('アイテムの情報を表示します')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('情報を表示するアイテム名')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('buy')
        .setDescription('アイテムを購入します')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('購入するアイテム名')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('quantity')
            .setDescription('購入する個数')
            .setRequired(true))),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const itemName = interaction.options.getString('name');
    const itemPrice = interaction.options.getInteger('price');
    const quantity = interaction.options.getInteger('quantity') || 1;

    switch (subcommand) {
      case 'create':
        return createItem(interaction, itemName, itemPrice);
      case 'delete':
        return deleteItem(interaction, itemName);
      case 'reset':
        return resetItem(interaction, itemName);
      case 'info':
        return infoItem(interaction, itemName);
      case 'buy':
        return buyItem(interaction, itemName, quantity);
      default:
        return interaction.reply({ content: '無効なコマンドです。' });
    }
  }
};
