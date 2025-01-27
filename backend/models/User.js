const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    pendingFriendRequests:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    sentFriendRequests:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    interests:[{
        type:String,
        trim:true
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('User',userSchema)