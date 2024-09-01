const { REST, Routes,Client, Events, GatewayIntentBits } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});


const commands = [];

// コマンドフォルダを取得
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // 各フォルダ内のコマンドファイルを取得
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // 各コマンドのデータをJSON形式で取得して配列に追加
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[警告] ${filePath} にあるコマンドは、"data" または "execute" プロパティが不足しています。`);
        }
    }
}

// RESTモジュールのインスタンスを作成してトークンを設定
const rest = new REST().setToken(token);

// コマンドをデプロイ
(async () => {
    try {
        console.log(`アプリケーションのスラッシュコマンド${commands.length}件の更新を開始します。`);

        // putメソッドを使ってギルド内のすべてのコマンドを現在のセットで更新
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`アプリケーションのスラッシュコマンド${data.length}件を正常に再読み込みしました。`);
    } catch (error) {
        // エラーハンドリング
        console.error(error);
    }
})();

client.login(token);