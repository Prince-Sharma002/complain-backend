import mongoose, { mongo } from "mongoose";


const URI = process.env.MONGODB_URI;



export const MongooseConnect = async ()=>{
    try{
        await mongoose.connect(URI);
        console.log("database connect")
    }
    catch(err){
        console.log("connection error")
        console.log(err)
        process.exit();
    }
}


