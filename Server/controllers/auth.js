const User=require("../model/model")
exports.createuser=async (req,res)=>{
    try {
        const user=new User({
            active:"yes",
            status:"0"
        })
    await user.save()
   // console.log(user)
    return res.json(user)
    } catch (error) {
        console.log(error)
    }
    
}

exports.leavinguser=async (req,res)=>{
    let userid=req.params.id
    try {
        const user=await User.findByIdAndUpdate({_id:userid},{
            $set:{active:"no",
                status:"0"
            }
        })
            
       // console.log("leaving user:",user)

       } catch (error) {
        console.log(error)
    }
    
}

exports.revisitinguser=async (req,res)=>{
    let userid=req.params.id
    try {
        const user=await User.findByIdAndUpdate({_id:userid},{
            $set:{active:"yes",
                status:"0"
            }
        })
            
       

       } catch (error) {
        console.log(error)
    }
    
}

exports.findremoteusers=async (req,res)=>{
    let userid=req.params.id
    try {
        const remoteuser = await User.find({ _id: { $ne: userid },
        active:"yes",
        status:"0" })
            
        return res.json(remoteuser)
       

       } catch (error) {
        console.log(error)
    }
    
}

exports.updatestatus=async (req,res)=>{
    let userid=req.params.id
    try {
        const user=await User.findByIdAndUpdate({_id:userid},{
            $set:{
                status:"1"
            }
        })
            
      

       } catch (error) {
        console.log(error)
    }
}

exports.updateonnext=async (req,res)=>{
    let userid=req.params.id
    try {
        await User.findByIdAndUpdate({_id:userid},{
            $set:{
                status:"0"
            }
        })
            
      

       } catch (error) {
        console.log(error)
    }
}

exports.nextuser=async (req,res)=>{
    const {username,remoteUser}=req.body
    let excludeids=[username,remoteUser]
    try {
        const newremoteUser = await User.find({ _id: { $nin: excludeids.map((id)=>new mongoose.Types.ObjectId(id)) },
        active:"yes",
        status:"0" })
            
        return res.json(newremoteUser)
       

       } catch (error) {
        console.log(error)
    }
    
}