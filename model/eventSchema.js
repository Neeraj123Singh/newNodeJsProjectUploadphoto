const mongo=require('mongoose');

const eventSchema = new mongo.Schema(
    {
        title:{
            type:String,
            required:true
        },
        createdBy:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        date:{
            type:String,
            required:true
        },
        time:{
            type:String,
            required:true
        },
        maximumParticipant:{
            type:Number,
            required:true
        } ,
        currentParticipant:{
            type:Number,
            required:true
        } 
    }
);

eventSchema.methods.update = async function (data){
    const {title,createdBy,description,maximumParticipant,date,time} = data;
    try{
        this.title = title;
        this.description = description;
        this.date = date;
        this.maximumParticipant = maximumParticipant;
        this.createdBy = createdBy;
        this.time = time;
        await this.save();
    }catch(err){
        console.log("Error Occured");
    }
}

const Event = mongo.model('Event', eventSchema);
module.exports = Event;