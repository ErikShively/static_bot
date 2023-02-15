const mongoose = require('mongoose')
const lfm_schema = new mongoose.Schema({
    title: String,
    description: String,
    schedule: [{
        day:String,
        start:String,
        end:String
    }],
    roles: [String],
    roster: [String],
    content: [String],
    lf: [String]
});
const LFM = mongoose.model('LFM', lfm_schema);
const LFM_DB = (object)=>{return new LFM(object)};

module.exports={
    LFM_DB
}