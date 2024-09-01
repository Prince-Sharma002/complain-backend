import 'dotenv/config';
import express from 'express';
import cors from 'cors'
import { MongooseConnect } from './db/db.js';
import { userComplain } from './model/complain-schema.js';

import bodyParser from 'body-parser';

const app = express();

var corsOptions = {
  origin: 'http://localhost:3000',
  credentials : true,
  method : "GET , POST, PUT, DELETE , PATCH , HEAD",

}

  // Increase the request payload limit
app.use(bodyParser.json({ limit: '10mb' })); // Set the limit as needed
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Or if you are using express.json and express.urlencoded middleware
app.use(express.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(cors(corsOptions));
app.use( express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.get('/getdata' , async (req,res)=>{
  try{
    const users = await userComplain.find({} );
    if( !userComplain || userComplain.length === 0 ){
      return res.status(404).json({message: "no data to send "});
    }
    return res.status(200).json(users);

  }
  catch(err){
    console.log(err)
  }

} )

app.post('/complain', async (req, res) => {
  try{
    console.log("data is  " , req.body)
    const {name , desciption , address , image , phone , email} = req.body;
    await userComplain.create({name , desciption , address , image , phone , email});
    return res.status(200).json({ msg : "data sent successfully" });
  }
  catch(err){
    console.log(err)
  }
});



// email
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "prince12845sharma@gmail.com", // Your email
    pass: "uvuv ssbr epzr xofs"  // Your email password
  }
});

export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "prince12845sharma@gmail.com",
    to ,
    subject ,
    text 
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};


app.post('/sendemail', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    const info = await sendEmail(to, subject, text);
    return res.status(200).json({ msg: "Email sent successfully", info });
  } catch (err) {
    console.log(err);
    res.status(500).send('Failed to send email');
  }
});


// delete 
app.delete( '/getdata/delete/:id' , async(req,res)=> {
  try{
    const id = req.params.id;
    await userComplain.deleteOne({_id : id});
    return res.status(200).json({ msg : "data deleted successfully" });
  }
  catch(err) {
    console.log(err)
  }
})



MongooseConnect().then(()=>{
  app.listen( '5000' , ()=>{
    console.log( 'Server is running on port 5000' );
} )
} )
