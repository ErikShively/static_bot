const {SlashCommandBuilder, ActionRow, ComponentType} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder} = require('discord.js');
const mongoose = require('mongoose');
const db_util = require('..//util//db_util')
const schedule_step = require('..//steps//schedule.js')
const roles_step = require('..//steps//roles.js')
const roster_step = require('..//steps//roster.js')
const content_step = require('..//steps//content.js')
const title_description_step = require('..//steps//title_description.js')

module.exports = {
    data: new SlashCommandBuilder().setName('setup_dm').setDescription('Sets up an LFG/LFM via DM with user'),
    async execute(interaction) {
      const timestamp = Date.now();
      const timeout = 1000 * 60 * 5; 
      const ending_timeout = 1000 * 10;
        let buttons = [];
        let rows = [];
        let ids = [];
        let lf_select_id = "lf_select" + timestamp + interaction.user.id;
        let done_btn_id = "lf_setup_done" + timestamp + interaction.user.id;
        let return_object = {schedule: null, roles: null, roster: null, content: null, title: null, description: null, lf: null, user: interaction.user.id}
        rows.push(new ActionRowBuilder().addComponents(new SelectMenuBuilder()
        .setPlaceholder("Looking For Group or Members")
        .setCustomId(lf_select_id)
        .addOptions([
            {label: "LFG", description: "Looking for a group", value: "LFG"},
            {label: "LFM", description: "Looking for a members", value: "LFM"},
        ])))
        let steps = [
            {style:ButtonStyle.Primary,id:"schedule" + timestamp + interaction.user.id,label:"Set Schedule",reply:""},
            {style:ButtonStyle.Primary,id:"roles" + timestamp + interaction.user.id,label:"Roles",reply:""},
            {style:ButtonStyle.Primary,id:"roster" + timestamp + interaction.user.id,label:"Roster",reply:""},
            {style:ButtonStyle.Primary,id:"content" + timestamp + interaction.user.id,label:"Content",reply:""},
            {style:ButtonStyle.Primary,id:"title_description" + timestamp + interaction.user.id,label:"Title/Description",reply:""},
        ];
        steps.forEach(currentValue=>{
            buttons.push(new ButtonBuilder().setCustomId(currentValue.id).setLabel(currentValue.label).setStyle(currentValue.style).setDisabled(true));
            ids.push(currentValue.id);
        });
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(0,5)));
        rows.push(new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Done").setCustomId(done_btn_id).setStyle(ButtonStyle.Secondary).setDisabled(true)));
      let dm = await interaction.user.send({content:"Get started by selecting a button", components: rows});
      filter=i=>{i.deferUpdate(); return true};
      const collector = dm.channel.createMessageComponentCollector({time: timeout}); //Consider adding idle arg
      collector.on('collect',async i =>{
          let interaction_object = {interaction: i, collector: collector, message: dm, components: rows, timeout: timeout, return_object: return_object};
          if(ids.includes(i.customId)){
            try{
                switch(i.customId){
                    case steps[0].id:
                        schedule_step.schedule(interaction_object);
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
                        break;
                }
            } catch (error) {
                await i.update({content: "An error has occurred. Please retry your command.", components:rows, ephemeral: true})
                collector.stop();
            }
          } else if(i.customId === lf_select_id){
            rows[1].components.forEach(component=>component.setDisabled(false));
            let selection = i.values[0];
            if(selection ==="LFG"){
                rows[1].components[1].setDisabled(true);
            } else {
                rows[1].components[1].setDisabled(false);
            }
            interaction_object.return_object.lf = selection;
            rows[0].components[0].setPlaceholder(selection);
            i.update({components: rows});
          } else if(i.customId === done_btn_id){
            // Force complete information before a submission
            rows.forEach(row=>{row.components.forEach(component=>component.setDisabled(true))});
            i.update({components: rows});
            db_object = db_util.LFM_DB(interaction_object.return_object);
            console.log(interaction_object.return_object);
            db_object.save(function(err){
                console.log("Test")
                if(err){
                    console.log(err);
                    return;
                }

        });
            collector.stop();
          }
      });
      collector.on('end', async j=>{
          rows.forEach(row=>{row.components.forEach(component=>component.setDisabled(true))});
          dm.edit({components:rows});
          setTimeout(()=>{
            dm.delete();
          }, ending_timeout);
      });
      await interaction.reply({content: "Check your DMs for further instructions.", ephemeral: true});
    }
};