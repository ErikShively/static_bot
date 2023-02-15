const { ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ButtonStyle, ComponentType} = require("discord.js");
const UUID = require("uuid");
const modal_utils = require('..\\util\\modal.js');
const time_block_parse = require('..\\util\\timeblock.js');
async function schedule(interaction_object){
    let i = interaction_object.interaction;
    await interaction_object.interaction.deferReply();
    interaction_object.components[0].components[0].setDisabled(true);
    interaction_object.message.edit({components: interaction_object.components});
    const timeout = interaction_object.timeout;
    const timestamp = Date.now();
    const relative_timestamp = `<t:${Math.round((timestamp + timeout)/1000)}:R>`;
    let modal_id = "schedule_button" + timestamp + i.user.id;
    let select_id = "time_zone_select" + timestamp + i.user.id;
    let done_id = "schedule_done_button" + timestamp + i.user.id;
    let time_blocks = [];
    let time_block_lines = [];
    let rows = [];
    let schedule_button = new ButtonBuilder().setCustomId(modal_id).setLabel("Set Schedule").setStyle(ButtonStyle.Primary).setDisabled(true);
    let done_button = new ButtonBuilder().setCustomId(done_id).setLabel("Done").setStyle(ButtonStyle.Secondary).setDisabled(true);

    rows.push(new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
        .setCustomId(select_id)
        .setPlaceholder("Select Timezone").addOptions(
            {label: "CST",
            description:"Central Time (America/Chicago)",
            value: "CST"},
            {label: "EST",
            description:"Eastern Time (America/New York City)",
            value: "EST"},
            )));

    rows.push(new ActionRowBuilder().addComponents(schedule_button, done_button));
    await interaction_object.interaction.editReply({content: `Enter your schedule. Prompt closes/closed ${relative_timestamp}`,components: rows}); //Have error handling for all interaction acknowledgements
    
    interaction_object.collector.on('collect', async j=>{
        if(j.customId===select_id) {
            time_zone = j.values[0];
            console.log(time_zone);
            rows[0].components[0].setPlaceholder(time_zone);
            rows[1].components[0].setDisabled(false);
            
            await j.update({components: rows});
        } else if(j.customId===modal_id) {
            modal_object = modal_utils.create_schedule_modal(j);
            await j.showModal(modal_object.modal);
            const submitted = await j.awaitModalSubmit({time:timeout});
            if(submitted && (submitted.customId === modal_object.modal_id)){
                console.log("Schedule modal submitted");

                rows[1].components[1].setDisabled(false);
                time_block_lines = submitted.fields.getTextInputValue(modal_object.times_id).split('\n');
                time_block_lines.forEach((time_block_element)=>time_block_element.replace(/\s/g,'')); //Removes all whitespace so validation is less strict.
                // Also might want to put in something to clean the input to make sure there's no harmful text here
                try{
                    await submitted.update({components: rows});
                } catch (error) {
                    console.log(error);
                }
            } 
        } else if(j.customId===done_id) {
            interaction_object.components[1].components[0].setStyle(ButtonStyle.Success);
            let valid_input = true;
            let valid_lines = [];
            let invalid_lines = [];
            time_block_lines.forEach(currentValue=>{
                let time_block = (time_block_parse.parse_timeblock(currentValue,time_zone));
                if(time_block.valid===true){
                    delete time_block.valid;
                    time_blocks.push(time_block);
                    valid_lines.push(currentValue);
                } else {
                    invalid_lines.push(currentValue);
                    valid_input = false;
                }
            });
            if(valid_input){
                interaction_object.return_object.schedule = time_blocks;
                let object_complete = true;
                for([key,value] of Object.entries(interaction_object.return_object)){
                    if(value === null){
                        object_complete = false;
                    }
                }
                if(object_complete===true){
                    interaction_object.components[2].components[0].setDisabled(false);
                    interaction_object.components[2].components[0].setStyle(ButtonStyle.Primary);
                }
                rows[1].components[0].setStyle(ButtonStyle.Secondary);
                rows[1].components[1].setStyle(ButtonStyle.Success);
                rows[1].components[1].setDisabled(false);
                rows.forEach(row=>{row.components.forEach(component=>component.setDisabled(true))});
                await interaction_object.interaction.followUp({content: "Schedule set!", ephemeral: true});
                await j.update({components: rows});
                await interaction_object.message.edit({components: interaction_object.components});
                await interaction_object.interaction.deleteReply();
            } else {
                console.log(valid_lines);
                console.log(invalid_lines);
                rows[1].components[0].setStyle(ButtonStyle.Danger);
                rows[1].components[1].setStyle(ButtonStyle.Secondary);
                rows[1].components[1].setDisabled(true);
                await interaction_object.interaction.followUp({content: "Invalid input", ephemeral: true});
                await j.update({components: rows});
            }
    };
})
interaction_object.collector.on('end', async j=>{
    try{
        await i.deleteReply();
    } catch (error) {

    }
})
};
module.exports={
    schedule
};