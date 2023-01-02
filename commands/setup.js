const {SlashCommandBuilder, Message, time, ActionRow, ComponentType} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder} = require('discord.js');
const UUID = require("uuid");
const schedule_step = require('..//steps//schedule.js')
const roles_step = require('..//steps//roles.js')
const roster_step = require('..//steps//roster.js')
const content_step = require('..//steps//content.js')
const title_description_step = require('..//steps//title_description.js')
module.exports = {
    data:
    new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Prompts the user to set up their LFG/LFM'),
    async execute(interaction) {
        const cmd_id = UUID.v4();
        interaction.command_id = cmd_id;
        // Add a UUID and delimiter and filter by that. Maybe also ensure that all customIds have it so that it can filter properly.
        // Might need to go back to multiple collectors. Also lock to one command active at a time with one submenu open at a time
        // Also might want to look at DMs instead of ephemeral messages -> interaction.user.send()
        // That probably takes components as normal. Hopefully.
        const timeout = 1000 * 60 * 10;
        const timestamp = Date.now();
        let buttons = [];
        let rows = [];
        let ids = [];
        let steps = [
            {style:ButtonStyle.Primary,id:"schedule" + timestamp + interaction.user.id,label:"Schedule",reply:""},
            {style:ButtonStyle.Primary,id:"roles" + timestamp + interaction.user.id,label:"Roles",reply:""},
            {style:ButtonStyle.Primary,id:"roster" + timestamp + interaction.user.id,label:"Roster",reply:""},
            {style:ButtonStyle.Primary,id:"content" + timestamp + interaction.user.id,label:"Content",reply:""},
            {style:ButtonStyle.Primary,id:"title_description" + timestamp + interaction.user.id,label:"Title/Description",reply:""},
        ];
        steps.forEach(currentValue=>{
            buttons.push(new ButtonBuilder().setCustomId(currentValue.id).setLabel(currentValue.label).setStyle(currentValue.style));
            ids.push(currentValue.id);
        });
        ids.concat(["time_zone_select","schedule_btn","schedule_done"]);
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(0,5)));
        // const menu_filter = i => {return ((ids.includes(i.customId)) && (i.user.id === interaction.user.id))};
        // const filter = (i) => ids.includes(i.customId) && (i.user.id === interaction.user.id);
        const filter = (i) => ((i.user.id === interaction.user.id) && (cmd_id === interaction.command_id));
        const collector = interaction.channel.createMessageComponentCollector({filter, time: timeout}); //Consider adding idle arg
        // const menu_collector = interaction.channel.createMessageComponentCollector({filter, time: timeout, componentType: ComponentType.Button});
        collector.on('collect',async i =>{
            let interaction_object = {interaction: i, collector: collector};
            try{
                switch(i.customId){
                    case steps[0].id:
                        console.log(rows[0].components[0]);
                        rows[0].components[0].setDisabled(true);
                        i.update({components: rows})
                        schedule_step.schedule(interaction_object);
                        i.update({components: rows})
                        rows[0].components[0].setDisabled(false);
                        break;
                    case steps[1].id:
                        roles_step.roles(interaction_object);
                        break;
                    case steps[2].id:
                        roster_step.roster(interaction_object);
                        break;
                    case steps[3].id:
                        content_step.content(interaction_object);
                        break;
                    case steps[4].id:
                        title_description_step.title_description(interaction_object);
                        break;
                    default:
                        // i.reply({content: "Unknown command", ephemeral: true});
                        break; //Actually just break here. Nothing should be done to the interaction.
                }
            } catch (error) {
                collector.stop();
                i.update({content: "An error has occurred. Please retry your command.", ephemeral: true})
            }
            // i.reply("Button Pushed");
            // reply to i with a functionally generated set of components
            // pass i by reference to the function
        });
        await interaction.reply({content: "CHOOSE. NOW.", components:rows, ephemeral: true})
        // Create functions to handle each step. Functions take an interaction and return an interaction. The wrapper will add on an additional action row for a next button
        // to move between steps/functions.
    }
};