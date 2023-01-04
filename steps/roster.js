const {ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
async function roster(interaction_object){
    
    let i = interaction_object.interaction;
    await interaction_object.interaction.deferReply();

    let timestamp = Date.now();
    let idx = -1;
    let rows = [];
    let return_list = [];
    let index_select_id = "roster_index_select" + timestamp + i.user.id;
    let class_select_id = "roster_class_select" + timestamp + i.user.id;
    let done_btn_id = "roster_done_button" + timestamp + i.user.id;
    let class_options_list = [{label: "Add Member", description:"Add A Member To The Roster", value: "ADD"}];
    let class_list_key = new Map();
    let class_list = [
        {label: "REMOVE", description: "Remove this role from the list", value: "REMOVE"},
        
        {label: "PLD", description: "Paladin", value: "PLD", emote: "<:Paladin:1058907219405590618>"},
        {label: "WHM", description: "White Mage", value: "WHM", emote: "<:WhiteMage:1058907297612582912>"},
        {label: "MNK", description: "Monk", value: "MNK", emote: "<:Monk:1058907415149551746>"},
        {label: "BRD", description: "Bard", value: "BRD", emote: "<:Bard:1058907343976402986>"},
        {label: "SMN", description: "Summoner", value: "SMN", emote: "<:Summoner:1058907490990956594>"}];

    class_list.forEach(element=>{class_list_key.set(element.value, {label: element.label, description: element.description, emote: element.emote})});
    class_list_key.set("UNST", {emote:":black_square_button:"});

    rows.push(new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
        .setCustomId(index_select_id)
        .setPlaceholder("Select Content").addOptions(class_options_list)));
    rows.push(new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
        .setCustomId(class_select_id)
        .setPlaceholder("No Roles Selected").addOptions(class_list)
            .setDisabled(true)));
    rows.push(new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Done")
        .setCustomId(done_btn_id)
        .setStyle(ButtonStyle.Primary)));

    interaction_object.collector.on('collect', async j=>{
        if((j.customId === index_select_id) || (j.customId === class_select_id)){        
            let selection = j.values[0];
            if(j.customId===index_select_id) {
                if(selection === "ADD"){
                    idx = class_options_list.length;
                    let new_entry = {label: "___", description: "An unset role", value: idx.toString(), return: "UNST"};
                    class_options_list.push(new_entry);
                    rows[0].components[0].setOptions(class_options_list)
                    .setPlaceholder("Role Added");
                    idx = -1;
                } else {
                    idx = parseInt(selection);
                    rows[0].components[0].setPlaceholder("See Below To Change Role");
                }
                if(idx != -1){
                    rows[1].components[0].setDisabled(false);
                    rows[1].components[0].setPlaceholder(class_options_list[idx].label);
                } else {
                    rows[1].components[0].setDisabled(true);
                }
            } else if(j.customId === class_select_id){
                if(selection === "REMOVE"){
                    class_options_list.splice(idx,1); 
                    class_options_list.forEach((element,index)=>{if(element.value != "ADD") {
                        element.value = index.toString();
                    }});
                    rows[0].components[0].setOptions(class_options_list)
                    .setPlaceholder("Role Removed");
                    rows[1].components[0].setPlaceholder("No Roles Selected");
                    idx = -1;
                    rows[1].components[0].setDisabled(true);
                } else {
                    class_options_list[idx].return = selection;
                    class_options_list[idx].label = class_list_key.get(selection).label;
                    class_options_list[idx].description = class_list_key.get(selection).description;
                    rows[0].components[0].setOptions(class_options_list)
                    .setPlaceholder(class_list_key.get(selection).label);
                    rows[1].components[0].setPlaceholder("Role Set");
                }
            }
            let temp_list = [];
            class_options_list.forEach(element=>{temp_list.push(element.return)});
            temp_list.splice(0,1);
            return_list = temp_list;
            let list_string = "";
            console.log(return_list);
            return_list.forEach(element=>{list_string = list_string + class_list_key.get(element).emote});
            await j.update({content: list_string, components: rows});
        } else if(j.customId === done_btn_id) {
            interaction_object.components[1].components[2].setStyle(ButtonStyle.Success);
            await interaction_object.message.edit({components: interaction_object.components});
            await interaction_object.interaction.deleteReply();
        }
    });
    interaction_object.collector.on('end', async j=>{
        try{
            await i.deleteReply();
        } catch (error) {

        }
    });
    await interaction_object.interaction.editReply({content: "Roster", components: rows});
}
module.exports={
    roster
};