const {ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
async function roles(interaction_object){
    
    let i = interaction_object.interaction;
    await interaction_object.interaction.deferReply();

    let timestamp = Date.now();
    let idx = -1;
    let rows = [];
    let return_list = [];
    let index_select_id = "role_index_select" + timestamp + i.user.id;
    let role_select_id = "role_select" + timestamp + i.user.id;
    let done_btn_id = "role_done_button" + timestamp + i.user.id;
    let roles_options_list = [{label: "Add Member", description:"Add A Member To The LFG List", value: "ADD"}];
    let class_list_key = new Map();
    let class_list = [
        {label: "REMOVE", description: "Remove this role from the list", value: "REMOVE"},
        
        {label: "TANK", description: "Tank", value: "TANK", emote: "<:TankRole:1058907165894656020>"},
        {label: "HEALER", description: "Healer", value: "HEAL", emote: "<:HealerRole:1058907153898934363>"},
        {label: "MELEE", description: "Melee DPS", value: "MDPS", emote: "<:Melee_DPS:1058908863526617208>"},
        {label: "RANGED", description: "Physical Ranged DPS", value: "RDPS", emote: "<:Ranged_DPS:1058908864071880727>"},
        {label: "CASTER", description: "Caster DPS", value: "CDPS", emote: "<:Caster_DPS:1058908862389956648>"}];

    class_list.forEach(element=>{class_list_key.set(element.value, {label: element.label, description: element.description, emote: element.emote})});
    class_list_key.set("UNST", {emote:":black_square_button:"});

    rows.push(new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
        .setCustomId(index_select_id)
        .setPlaceholder("Select Content").addOptions(roles_options_list)));
    rows.push(new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
        .setCustomId(role_select_id)
        .setPlaceholder("No Roles Selected").addOptions(class_list)
            .setDisabled(true)));
    rows.push(new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("Done")
        .setCustomId(done_btn_id)
        .setStyle(ButtonStyle.Primary)));

    interaction_object.collector.on('collect', async j=>{
        if((j.customId === index_select_id) || (j.customId === role_select_id)){        
            let selection = j.values[0];
            if(j.customId===index_select_id) {
                if(selection === "ADD"){
                    idx = roles_options_list.length;
                    let new_entry = {label:"___", description: "An unset role", value: idx.toString(), return: "UNST", emote:"<:black_square_button:1058924242630103150>"};
                    roles_options_list.push(new_entry);
                    rows[0].components[0].setOptions(roles_options_list)
                    .setPlaceholder("Role Added");
                    idx = -1;
                } else {
                    idx = parseInt(selection);
                    rows[0].components[0].setPlaceholder("See Below To Change Role");
                }
                if(idx != -1){
                    rows[1].components[0].setDisabled(false);
                    rows[1].components[0].setPlaceholder(roles_options_list[idx].label);
                } else {
                    rows[1].components[0].setDisabled(true);
                }
            } else if(j.customId === role_select_id){
                if(selection === "REMOVE"){
                    roles_options_list.splice(idx,1); 
                    roles_options_list.forEach((element,index)=>{if(element.value != "ADD") {
                        element.value=index.toString();
                    }});
                    rows[0].components[0].setOptions(roles_options_list)
                    .setPlaceholder("Role Removed");
                    rows[1].components[0].setPlaceholder("No Roles Selected");
                    idx = -1;
                    rows[1].components[0].setDisabled(true);
                } else {
                    roles_options_list[idx].return = selection;
                    roles_options_list[idx].label = class_list_key.get(selection).label;
                    roles_options_list[idx].description = class_list_key.get(selection).description;
                    rows[0].components[0].setOptions(roles_options_list)
                    .setPlaceholder(class_list_key.get(selection).label);
                    rows[1].components[0].setPlaceholder("Role Set");
                }
            }
            let temp_list = [];
            roles_options_list.forEach(element=>{temp_list.push(element.return)});
            temp_list.splice(0,1);
            return_list = temp_list;
            let list_string = "";
            console.log(return_list);
            return_list.forEach(element=>{list_string = list_string + class_list_key.get(element).emote});

            await j.update({content: list_string, components: rows});
        } else if(j.customId === done_btn_id){
            interaction_object.components[1].components[1].setStyle(ButtonStyle.Success);
            interaction_object.return_object.roles = return_list;
            await interaction_object.message.edit({components: interaction_object.components}); //To be called when the list is actually submitted
            await interaction_object.interaction.deleteReply();
        }
    });
    interaction_object.collector.on('end', async j=>{
        try{
            await i.deleteReply();
        } catch (error) {

        }
    });
    await interaction_object.interaction.editReply({content: "Roles", components: rows});
}
module.exports={
    roles
};