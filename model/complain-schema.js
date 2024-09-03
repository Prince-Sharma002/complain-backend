import mongoose from "mongoose";

const complainSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,
  },
  desciption : {
    type : String,
    required : true,
  },
  address : {
    type : Array,
    required : true,
  },
  image : {
    type : String,
    required : true,
  },
  phone : {
    type : String,
    required : true,
  },
  email : {
    type : String,
    required : true,
  },
  progress : {
    type : Number,
    default : 0,
    min : 0,
    max : 3,
  },
  pid : {
    type : String,
    default : "asdfghjkl"
  }
})

export const userComplain = new mongoose.model( "Complain" , complainSchema );