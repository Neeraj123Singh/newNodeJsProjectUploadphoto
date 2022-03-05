const mongo=require('mongoose');

const userEventSchema = new mongo.Schema(
    {
        eventId:{
            type:String,
            required:true
        },
        userId: {
            type:String,
            required:true
        }
    }
);



const UserEvent = mongo.model('UserEvent', userEventSchema);
module.exports = UserEvent;