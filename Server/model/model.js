const mongoose=require("mongoose")

const userschema= new mongoose.Schema(
    {
        active:{type:String},
        status:{type:String}
    },
   {timestamps:true}
   
)

module.exports=mongoose.model("user",userschema)