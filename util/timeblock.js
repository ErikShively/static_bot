// include moment to convert local time to 24 hr time so parse works

function to_parse_format(time_in){
    let time_out = "";
    let time_split = time_in.toUpperCase().split(':');
    let hours = time_split[0];
    let minutes = time_split[1];
    let minutes_array = Array.from(minutes);
    let meridian = "";
    if(minutes.includes("AM")){
        let filter = (currentValue)=>(currentValue != "A" && currentValue != "M")
        time_out = Array.from(time_in).filter(filter).join('') + ":00";
        console.log(time_out);
    } else if(minutes.includes("PM")) {
        let filter = (currentValue)=>(currentValue != "P" && currentValue != "M")
        time_out = (parseInt(hours) + 12) + ":" + Array.from(minutes).filter(filter).join('') + ":00";
        console.log(time_out);
    } else {
        time_out = time_in + ":00"
    }
    return time_out;
}

function parse_timeblock(time_block, time_zone){
    let return_object = {valid:true};
    let delimiters = ['@','-'];
    let delimiter_filter = (currentValue)=>(time_block.split(currentValue).length - 1) === 1
    let has_delimiters = (delimiters.every(delimiter_filter));
    if(has_delimiters){
        let date_starter = "25 Dec 2022"; //Any arbitrary date will do
        let valid_days = ["Mon","Tues","Wed","Thurs","Fri","Sat","Sun"];
        let split_block = time_block.split('@');
        let split_times = split_block[1].split('-');
        let valid_day = valid_days.includes(split_block[0]);
        let has_start_and_end = split_times.length===2;

        if(valid_day && has_start_and_end){
            return_object.day = split_block[0];
            let parsed_start = Date.parse(date_starter + ' ' + to_parse_format(split_times[0]) + ' ' + time_zone)/1000;
            if(!isNaN(parsed_start)){
                return_object.start = parsed_start;
            } else {
                return_object.valid=false;
            }
            
            let parsed_end = Date.parse(date_starter + ' ' + to_parse_format(split_times[1]) + ' CST')/1000;
            if(!isNaN(parsed_end)){
                return_object.end = parsed_end;
            } else {
                return_object.valid=false;
            }

        } else {
            return_object.valid=false;
        }
    } else{
        return_object.valid=false;
    }

    return return_object;
};

module.exports={
    parse_timeblock
};