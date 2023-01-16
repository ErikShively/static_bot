const modal_utils = require('..\\util\\modal.js');
const {ButtonStyle} = require('discord.js')
async function title_description(interaction_object){
    const timeout = interaction_object.timeout;
    modal_object = modal_utils.create_title_description_modal(interaction_object.interaction);
    await interaction_object.interaction.showModal(modal_object.modal);
    const submitted = await interaction_object.interaction.awaitModalSubmit({time:timeout});
    if(submitted && (submitted.customId === modal_object.modal_id)){
        console.log("Title description modal submitted");
        interaction_object.return_object.title = (submitted.fields.getTextInputValue(modal_object.title_id));
        interaction_object.return_object.description = (submitted.fields.getTextInputValue(modal_object.description_id));
        try{
            interaction_object.components[1].components[4].setStyle(ButtonStyle.Success);
            interaction_object.message.edit({components: interaction_object.components});
            await submitted.update({content:"Title and description set!", ephemeral:true});
        } catch(error){
            console.log(error);
        }
    }
}
module.exports={
    title_description
};