const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');
// Cancelling a modal without input and then submitting a modal with input will cause a crash
function create_schedule_modal(i){
    const timestamp = Date.now();
    let return_object = {};
    return_object.modal_id = "schedule_modal" + timestamp + i.user.id;
    return_object.times_id = return_object.modal_id + 'times_entry';
    return_object.modal = new ModalBuilder().setCustomId(return_object.modal_id).setTitle("Enter your schedule");
    const timeEntryInput = new TextInputBuilder();
    timeEntryInput.setCustomId(return_object.times_id).setLabel("Please format as you see the placeholder") //Set the custom id to something more unique and return an object with the customId
    .setPlaceholder("Mon@5:00PM-6:30PM\nMon@7:30PM-10:00PM\nTues@6:00PM-7:00PM\n")
    .setMaxLength(250)
    .setStyle(TextInputStyle.Paragraph);
    const firstActionRow = new ActionRowBuilder().addComponents(timeEntryInput);
    return_object.modal.addComponents(firstActionRow);
    return return_object;
};
function create_title_description_modal(i){
    const timestamp = Date.now();
    let return_object = {};
    let rows = [];
    return_object.modal_id = "title_description_modal" + timestamp + i.user.id;
    return_object.title_id = return_object.modal_id + 'title_entry';
    return_object.description_id = return_object.modal_id + 'description_entry';
    const modal = new ModalBuilder().setCustomId(return_object.modal_id).setTitle("Enter your title and description");

    const title_input = new TextInputBuilder();
    title_input.setCustomId(return_object.title_id).setLabel("Title")
    .setMaxLength(250)
    .setStyle(TextInputStyle.Short);
    rows.push(new ActionRowBuilder().addComponents(title_input));

    const description_input = new TextInputBuilder();
    description_input.setCustomId(return_object.description_id).setLabel("Description")
    .setMaxLength(2500)
    .setStyle(TextInputStyle.Paragraph);
    rows.push(new ActionRowBuilder().addComponents(description_input));

    modal.addComponents(rows);
    return_object.modal = modal;
    return return_object;
};
module.exports={
    create_schedule_modal,
    create_title_description_modal
};
// export default create_modal;