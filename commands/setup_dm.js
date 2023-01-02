const {SlashCommandBuilder, ActionRow, ComponentType} = require('discord.js');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder} = require('discord.js');
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
        let steps = [
            {style:ButtonStyle.Primary,id:"schedule" + timestamp + interaction.user.id,label:"Schedule",reply:""},
            {style:ButtonStyle.Primary,id:"roles" + timestamp + interaction.user.id,label:"Roles",reply:""},
            {style:ButtonStyle.Primary,id:"roster" + timestamp + interaction.user.id,label:"Roster",reply:""},
            {style:ButtonStyle.Primary,id:"content" + timestamp + interaction.user.id,label:"Content",reply:""},
            {style:ButtonStyle.Primary,id:"title_description" + timestamp + interaction.user.id,label:"Title/Description",reply:""},
        ];
        steps.forEach(currentValue=>{
            buttons.push(new ButtonBuilder().setCustomId(currentValue.id).setLabel(currentValue.label).setStyle(currentValue.style));
        });
        rows.push(new ActionRowBuilder().addComponents(buttons.slice(0,5)));
      let dm = await interaction.user.send({content:"Get started by selecting a button", components: rows});
      filter=i=>{i.deferUpdate(); return true};
      const collector = dm.channel.createMessageComponentCollector({time: timeout}); //Consider adding idle arg
      collector.on('collect',async i =>{
          let interaction_object = {interaction: i, collector: collector, message: dm, components: rows, timeout: timeout};
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
      });
      collector.on('end', async j=>{
          rows.forEach(row=>{row.components.forEach(component=>component.setDisabled(true))});
          dm.edit({components:rows});
          setTimeout(()=>{
            dm.delete();
          }, ending_timeout);
      });
      await interaction.reply({content: "Check your DMs for further instructions. <:WorryU:1058982837732245554>", ephemeral: true});
    }
};