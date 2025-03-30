const mongoose=require('mongoose')
const eventSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    time:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    maxAttendees: { 
        type: Number,
        required: true },
        currentAttendees: { 
        type: Number, 
        default: 0 },

    image:{
        type:String,
    },
    createdBy:{
        type:String,
        required:true
    },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // ✅ Store registered user IDs
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;