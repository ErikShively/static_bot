const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const filePath = path.join(commandsPath,file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

async function mongoose_connect(){
    await mongoose.connect("");
};

// When the client is ready, run this code (only once)
client.once('ready', () => {
    // Tags.sync;
	console.log('Ready!');
});
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }

});
// client.on('interactionCreate',interaction => {
//     if(!interaction.isButton()) return;
//     // console.log(interaction.customId);
//     interaction.reply({content: interaction.customId, ephemeral: true})
// });
// Login to Discord with your client's token
client.login(token);

