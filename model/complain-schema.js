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
  }
})

export const userComplain = new mongoose.model( "Complain" , complainSchema );