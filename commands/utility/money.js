const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ファイルパス
const dataFilePath = path.join(__dirname, '/coins.json');
const itemsFilePath = path.join(__dirname, '/userItems.json');
const cooldownFilePath = path.join(__dirname, '/cooldowns.json');

// クールダウンの時間（30秒）
const cooldownTime = 30 * 1000; // 30秒（ミリ秒）

// コインデータを読み込む関数
const readData = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(data);
};

// コインデータを保存する関数
const saveData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// クールダウンデータを読み込む関数
const readCooldowns = () => {
  if (!fs.existsSync(cooldownFilePath)) {
    fs.writeFileSync(cooldownFilePath, JSON.stringify({}));
  }
  const data = fs.readFileSync(cooldownFilePath, 'utf-8');
  return JSON.parse(data);
};

// クールダウンデータを保存する関数
const saveCooldowns = (data) => {
  fs.writeFileSync(cooldownFilePath, JSON.stringify(data, null, 2));
};

// クールダウンの確認関数
const checkCooldown = (userId, command) => {
  const cooldowns = readCooldowns();
  const userCooldowns = cooldowns[userId] || {};
  const lastUsed = userCooldowns[command] || 0;
  const now = Date.now();
  const timeLeft = cooldownTime - (now - lastUsed);

  if (timeLeft > 0) {
    return timeLeft; // クールダウン中の場合は残り時間を返す
  }

  return 0; // クールダウンが終了している場合は0を返す
};

// クールダウンのセット関数
const setCooldown = (userId, command) => {
  const cooldowns = readCooldowns();
  if (!cooldowns[userId]) {
    cooldowns[userId] = {};
  }
  cooldowns[userId][command] = Date.now();
  saveCooldowns(cooldowns);
};

// /money work コマンド
const moneyWork = async (interaction) => {
  const userId = interaction.user.id;
  const timeLeft = checkCooldown(userId, 'work');

  if (timeLeft > 0) {
    return interaction.reply(`クールダウン中です。あと ${(timeLeft / 1000).toFixed(1)}秒後に実行できます。`);
  }

  const data = readData();
  const coins = Math.floor(Math.random() * 501) + 500;
  const currentCoins = data[userId] || 0;

  data[userId] = currentCoins + coins;
  saveData(data);

  setCooldown(userId, 'work');

  const embed = new EmbedBuilder()
    .setColor('Green')
    .setTitle('仕事完了！')
    .setDescription(`お仕事をして ${coins} コインを獲得しました！\n現在のコイン: ${data[userId]}`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
};

// /money crime コマンド
const moneyCrime = async (interaction) => {
  const userId = interaction.user.id;
  const timeLeft = checkCooldown(userId, 'crime');

  if (timeLeft > 0) {
    return interaction.reply(`クールダウン中です。あと ${(timeLeft / 1000).toFixed(1)}秒後に実行できます。`);
  }

  const data = readData();
  const failed = Math.random() < 0.05;
  let coinsChange;

  if (failed) {
    coinsChange = -Math.floor(Math.random() * 501) - 500;
  } else {
    coinsChange = Math.floor(Math.random() * 1001) + 500;
  }

  const currentCoins = data[userId] || 0;
  const newCoins = Math.max(currentCoins + coinsChange, 0); // コインが0未満にならないようにする
  data[userId] = newCoins;

  saveData(data);
  setCooldown(userId, 'crime');

  const embed = new EmbedBuilder()
    .setColor(failed ? 'Red' : 'Green')
    .setTitle(failed ? '犯罪失敗！' : '犯罪成功！')
    .setDescription(failed
      ? `失敗しました。${-coinsChange} コインを失いました。\n現在のコイン: ${newCoins}`
      : `成功しました！ ${coinsChange} コインを獲得しました。\n現在のコイン: ${newCoins}`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
};

// /money slut コマンド
const moneySlut = async (interaction) => {
  const userId = interaction.user.id;
  const timeLeft = checkCooldown(userId, 'slut');

  if (timeLeft > 0) {
    return interaction.reply(`クールダウン中です。あと ${(timeLeft / 1000).toFixed(1)}秒後に実行できます。`);
  }

  const data = readData();
  const failed = Math.random() < 0.03;
  let coinsChange;

  if (failed) {
    coinsChange = -Math.floor(Math.random() * 501) - 500;
  } else {
    coinsChange = Math.floor(Math.random() * 501) + 500;
  }

  const currentCoins = data[userId] || 0;
  const newCoins = Math.max(currentCoins + coinsChange, 0); // コインが0未満にならないようにする
  data[userId] = newCoins;

  saveData(data);
  setCooldown(userId, 'slut');

  const embed = new EmbedBuilder()
    .setColor(failed ? 'Red' : 'Green')
    .setTitle(failed ? '失敗！' : '成功！')
    .setDescription(failed
      ? `失敗しました。${-coinsChange} コインを失いました。\n現在のコイン: ${newCoins}`
      : `成功しました！ ${coinsChange} コインを獲得しました。\n現在のコイン: ${newCoins}`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
};

// メインコマンド
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
