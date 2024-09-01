const { Client, Intents } = require("discord.js");
require("dotenv").config();
const config = require("./config.json");

const client = new Client({
    intents: [
        intents.FLAGS.GUILDS,
        intents.FLAGS.GUILDS_MEMBERS,
        intents.FLAGS.GUILDS_INVITES,
        intents.FLAGS.GUILDS_MESSAGES
    ],
});
