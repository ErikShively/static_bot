const {SlashCommandBuilder, Message, time, ActionRow, ComponentType} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder} = require('discord.js');
const modal_utils = require('..\\util\\modal.js');
const time_block_parse = require('..\\util\\timeblock.js');

module.exports = {
    data:
    new SlashCommandBuilder()
    .setName('button')
    .setDescription('Replies with a button'),
    async execute(interaction) {
        // let modal = modal_utils.create_modal(i);
        let time_zone = "";
        interaction.data={};
        let ids = [];
        let rows = [];
        let buttons = [];
        let labels = 
        [["Monday", "Mon", ButtonStyle.Secondary],
        ["Tuesday", "Tues", ButtonStyle.Secondary],
        ["Wednesday", "Wed", ButtonStyle.Secondary],
        ["Thursday", "Thurs", ButtonStyle.Secondary],
        ["Friday", "Fri", ButtonStyle.Secondary],
        ["Saturday", "Sat", ButtonStyle.Secondary],
        ["Sunday", "Sun", ButtonStyle.Secondary],
        ["All Days", "Time Entry Modal", ButtonStyle.Secondary],
        ["Done", "done", ButtonStyle.Primary]];
        labels.forEach(currentValue=>{
            buttons.push(new ButtonBuilder().setCustomId(currentValue[1]).setLabel(currentValue[0]).setStyle(currentValue[2]));
            ids.push(currentValue[1]);
        });
        rows.push(new ActionRowBuilder().addComponents(
            new SelectMenuBuilder()
            .setCustomId("time_zone_select")
            .setPlaceholder("Select Timezone").addOptions(
                {label: "CST",
                description:"Central Time (America/Chicago)",
                value: "CST"},
                {label: "EST",
                description:"Eastern Time (America/New York City)",
                value: "EST"},
                )
        ))
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(0,5)));
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(5,9)));
        const timeout = 1000 * 60 * 10;
        const filter = (i) => ids.includes(i.customId) && (i.user.id === interaction.user.id);
        const collector = interaction.channel.createMessageComponentCollector({filter, time: timeout, componentType: ComponentType.Button});
        const select_filter = (i) => (i.customId === "time_zone_select") && (i.user.id === interaction.user.id);
        const select_collector = interaction.channel.createMessageComponentCollector({select_filter, time: timeout, componentType: ComponentType.SelectMenu});
        const timestamp = `<t:${Math.round((Date.now() + timeout)/1000)}:R>`;
        select_collector.on('collect', async i=>{
            time_zone = i.values[0];
            console.log(time_zone);
            await i.update("Time zone set");
        })
        collector.on('end', async i=>{
                rows.forEach(row=>row.components.forEach(button=>button.setDisabled(true)));
                await interaction.editReply({content: "Closing prompt. Please dismiss this message.", components: rows});
        });
        collector.on('collect', async i=>{
            if(i.customId == "done"){
                collector.stop();
                await i.update({content: "Closing prompt. Please dismiss this message.", components: rows});
            }else{
                let modal = modal_utils.create_modal(i);
                await i.showModal(modal);
                const submitted = await i.awaitModalSubmit({time:timeout});
                if(submitted){
                    // Function to parse the strings
                    if(i.customId == "Time Entry Modal"){
                        let valid_input = true;

                        let invalid_lines = [];
                        let valid_lines = [];
                        let time_blocks = [];

                        let time_block_lines = submitted.fields.getTextInputValue("All days entry").split('\n');

                        time_block_lines.forEach(currentValue=>{
                            let time_block = (time_block_parse.parse_timeblock(currentValue,time_zone));
                            if(time_block.valid===true){
                                time_blocks.push(time_block);
                                valid_lines.push(currentValue);
                            } else {
                                invalid_lines.push(currentValue);
                                valid_input = false;
                            }
                        });
                        if(valid_input){
                            console.log(time_blocks);
                        } else {
                            console.log(valid_lines);
                            console.log(invalid_lines);
                        }
                    } else {
                        
                    }
                    await submitted.update({ephemeral: true, components: rows});
                    // await submitted.reply({ephemeral: true, components: rows});
                }
            }
        });
        await interaction.reply({content: `Click a day to input your time. For \"All Days,\" Please use \`Mon Tues Wed Thurs Fri Sat Sun\` for days. Prompt times out ${timestamp}`, components: rows, ephemeral: true});
    }
};