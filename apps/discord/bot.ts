import { Client, GatewayIntentBits, ModalBuilder, ActionRowBuilder, Events, TextInputBuilder, TextInputStyle, ModalActionRowComponentBuilder } from 'discord.js';
import { postPaste } from './api';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const uploadModal = () => {
    const modal = new ModalBuilder()
        .setTitle('zer0bin paste')
        .setCustomId('uploadModal')

    const rawTextInput = new TextInputBuilder()
        .setCustomId('rawText')
        .setLabel("Paste your text here")
        .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
        .addComponents(rawTextInput);

    modal.addComponents(actionRow);

    return modal;
}

export const app = async (token: string) =>{
    client.on('ready', () => {
        if(!client.user){
            return;
        }
        console.log(`Logged in as ${client.user.tag}!`);
    });
    
    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isChatInputCommand()) return;
        
        if (interaction.commandName === 'snip') {
            await interaction.showModal(uploadModal());
        }
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isModalSubmit()) return;

        if (interaction.customId === 'uploadModal') {
            const rawText = interaction.fields.getTextInputValue('rawText');
            const { success, paste_url } = await postPaste(rawText);
            if (!success) {
                await interaction.reply({ content: 'There was an error processing your submission', ephemeral: true });
                return;
            }
            await interaction.reply({ content: `Your paste has been uploaded to ${paste_url}`, ephemeral: true });
            await interaction.user.send(`Your paste has been uploaded to ${paste_url}`);
        }
    });
    
    client.login(token);
}