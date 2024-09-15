const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('サーバーの情報を表示します'),

    async execute(interaction) {
        if (!interaction.guild) {
            await interaction.reply('このコマンドはサーバー内でのみ実行できます。');
            return;
        }

        const guild = interaction.guild;
        const roles = guild.roles.cache.size - 1; // @everyone を除く
        const members = guild.memberCount;
        const channels = guild.channels.cache.size;
        const emojis = guild.emojis.cache.size;
        const owner = await guild.fetchOwner();

        // ステータスごとのメンバー数をカウント
        const onlineCount = guild.members.cache.filter(member => member.presence?.status === 'online').size;
        const idleCount = guild.members.cache.filter(member => member.presence?.status === 'idle').size;
        const dndCount = guild.members.cache.filter(member => member.presence?.status === 'dnd').size;
        const offlineCount = guild.members.cache.filter(member => member.presence?.status === 'offline' || !member.presence).size;

        // サーバーアイコンのURLを取得
        const iconURL = guild.iconURL({ dynamic: true, size: 4096 });

        // 日本時間での作成日の取得
        const createdAtJP = guild.createdAt.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });

        const embed = new EmbedBuilder()
            .setTitle('サーバー情報')
            .setColor('#7289da')
            .setThumbnail(iconURL || guild.iconURL({ dynamic: true })) // サーバーアイコンを設定。存在しない場合はデフォルトのアイコン
            .addFields(
                { name: 'サーバー名', value: guild.name || '\u200B', inline: true },
                { name: 'サーバーID', value: guild.id || '\u200B', inline: true },
                { name: '作成日', value: createdAtJP || '\u200B', inline: true }, // 日本時間で年月日形式で表示
                { name: 'オーナー', value: interaction.guild.members.cache.get(owner.id).toString() || '\u200B', inline: true }, // オーナーをメンションに変換
                { name: 'メンバー数', value: members.toString() || '\u200B', inline: true },
                { name: 'ロール数', value: roles.toString() || '\u200B', inline: true },
                { name: 'チャンネル数', value: channels.toString() || '\u200B', inline: true },
                { name: '絵文字数', value: emojis.toString() || '\u200B', inline: true },
                { name: 'ステータス', value: 
                    `🟢 **オンライン**: ${onlineCount || '\u200B'}\n` +
                    `🟡 **離席中**: ${idleCount || '\u200B'}\n` +
                    `⛔️ **取り込み中**: ${dndCount || '\u200B'}\n` +
                    `⚫️ **オフライン**: ${offlineCount || '\u200B'}`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    },
};
