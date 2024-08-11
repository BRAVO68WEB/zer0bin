import { REST, Routes } from 'discord.js';

export interface Command {
    name: string;
    description: string;
}

export class CommandManager {
    private commands : Command[] = [];
    private rest_client : REST;
    private client_id : string;
    private guild_id : string;

    constructor(token: string, client_id: string, guild_id: string) {
        this.rest_client = new REST({ version: '10' }).setToken(token);
        this.client_id = client_id;
        this.guild_id = guild_id;
    }

    public addCommand = (command: Command) =>{
        this.commands.push(command);
    }

    public registerCommands = async () => {
        await this.rest_client.put(Routes.applicationGuildCommands(this.client_id, this.guild_id), { body: this.commands });
        console.log(`Registered ${this.commands.length} commands.`);
    }
}

