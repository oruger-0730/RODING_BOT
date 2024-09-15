const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');

// RESTクライアントの作成
const rest = new REST({ version: '10' }).setToken(token); // ここでrestを定義します

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const commands = []; // commands配列を作成

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON()); // commands配列にコマンドを追加
		} else {
			console.log(`[警告] ${filePath} のコマンドに必要な "data" または "execute" プロパティがありません。`);
		}
	}
}

// コマンドをDiscordに登録
(async () => {
	try {
		console.log(`現在 ${commands.length} 個のアプリケーション (/) コマンドをリフレッシュしています。`);

		// putメソッドは、現在のコマンドセットでギルド内のすべてのコマンドを完全にリフレッシュするために使用されます
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`成功しました。${data.length} 個のアプリケーション (/) コマンドがリロードされました。`);
	} catch (error) {
		// もちろん、エラーをキャッチしてログに記録することを忘れずに！
		console.error(error);
	}
})();

client.once(Events.ClientReady, readyClient => {
	console.log(`準備完了！${readyClient.user.tag} としてログインしました。`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`${interaction.commandName} に対応するコマンドが見つかりませんでした。`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3; // デフォルトのクールダウン時間を3秒に設定
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `クールダウン中です。コマンド \`${command.data.name}\` を再び使用できるのは <t:${expiredTimestamp}:R> です。`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'このコマンドの実行中にエラーが発生しました。', ephemeral: true });
		} else {
			await interaction.reply({ content: 'このコマンドの実行中にエラーが発生しました。', ephemeral: true });
		}
	}
});

client.login(token);