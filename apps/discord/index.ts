import config from './config.json';

import { CommandManager, Command } from "./command";
import { app } from "./bot";

if(
    !config.api_url &&
    !config.discord.token &&
    !config.discord.client_id &&
    !config.discord.guild_id &&
    !config.public_url
){
    console.error("Please set DISCORD_TOKEN and DISCORD_CLIENT_ID in config.json file");
    process.exit(1);
}

const uploadCommand: Command = {
    name: "snip",
    description: "Upload a text snippet"
};

const commandManager = new CommandManager(config.discord.token, config.discord.client_id, config.discord.guild_id);

commandManager.addCommand(uploadCommand);

await commandManager.registerCommands();

await app(
    config.discord.token
);