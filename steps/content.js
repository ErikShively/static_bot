const {ActionRowBuilder, SelectMenuBuilder, ButtonStyle} = require('discord.js');
async function content(interaction_object){
    let i = interaction_object.interaction;
    await interaction_object.interaction.deferReply();

    let timestamp = Date.now();
    let select_id = "content_select" + timestamp + i.user.id;
    let rows = [];
    rows.push(new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
        .setCustomId(select_id)
        .setPlaceholder("Select Content").addOptions(
            {label: "DSR",
            description:"Dragonsong's Reprise",
            value: "DSR"},
            {label: "6.3 Ultimate",
            description:"Upcoming Ultimate",
            value: "6.3"},
            {label: "P8S",
            description:"Abyssos Savage 4th Turn",
            value: "P8S"},
            {label: "P7S",
            description:"Abyssos Savage 3rd Turn",
            value: "P7S"},
            {label: "P6S",
            description:"Abyssos Savage 2nd Turn",
            value: "P6S"},
            {label: "P5S",
            description:"Abyssos Savage 1st Turn",
            value: "P5S"},
            {label: "Abyssos",
            description:"Tier 2 Savage",
            value: "6.2"},
            )));
    interaction_object.collector.on('collect', async j=>{
        if(j.customId===select_id) {
            selection = j.values[0];
            rows[0].components[0].setPlaceholder(selection);
            interaction_object.content = selection;
            await j.update({components: rows});
            interaction_object.components[1].components[3].setStyle(ButtonStyle.Success);
            await interaction_object.message.edit({components: interaction_object.components});
            await interaction_object.interaction.deleteReply();
        }
    });
    await interaction_object.interaction.editReply({content: "Content", components:rows});
    interaction_object.collector.on('end', async j=>{
        try{
            await i.deleteReply();
        } catch (error) {

        }
    })
}
module.exports={
    content
};