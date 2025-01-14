import 'dotenv/config';
import express from 'express';
import cors from 'cors'
import { MongooseConnect, gfs, gridfsBucket } from "./db/db.js";
import { userComplain } from './model/complain-schema.js';
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

import bodyParser from 'body-parser';

const app = express();

const allowedOrigins = [
  'https://geo-mesh-front.vercel.app/admin',
  'http://127.0.0.1:5500/frontend/admin.html',
  'https://complain-frontend.vercel.app',
  'https://geo-mesh-front-n4bmp0rr8-prince-sharma002s-projects.vercel.app/admin',
  'https://geo-mesh-front.vercel.app/map',
  'https://geo-mesh-front.vercel.app/admin', // Add more origins here
  'http://localhost:3000', // Localhost for testing
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
};



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
    const {name , desciption , address , image , phone , email , } = req.body;
    await userComplain.create({name , desciption , address , image , phone , email , progress : 1 , pid : "qwertyuiop" });
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
    user: "complainbox757@gmail.com", // Your email
    pass: "daef peiz ajwd kcjt"  // Your email password
  }
});

export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "complainbox757@gmail.com",
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

// complain mail
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

// segment delete 
app.post('/sendemail2', async (req, res) => {
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



// update progress
app.post('/updateprogress', async (req, res) => {
  try {
      const { _id, progress } = req.body;
      
      // Use async/await with Mongoose
      const updatedComplain = await userComplain.findByIdAndUpdate(
          _id,
          { progress },
          { new: true }
      );
      
      if (!updatedComplain) {
          return res.status(404).json({ message: 'Complaint not found' });
      }

      res.status(200).json(updatedComplain);
  } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


// images
// Multer GridFS Storage Configuration
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
      return {
          bucketName: "uploads", // Collection name in GridFS
          filename: `${Date.now()}-${file.originalname}`, // Customize filename
      };
  },
});

// Initialize `upload` middleware
const upload = multer({ storage });

// File Upload Route
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
  }
  res.status(200).json({ file: req.file });
});

// Fetch Image by ID
app.get("/image/:id", async (req, res) => {
  try {
      const file = await gfs.files.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });

      if (!file) {
          return res.status(404).json({ error: "File not found" });
      }

      // Check if the file is an image
      if (file.contentType.startsWith("image/")) {
          const readStream = gridfsBucket.openDownloadStream(file._id);
          readStream.pipe(res);
      } else {
          res.status(400).json({ error: "File is not an image" });
      }
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});



MongooseConnect().then(()=>{
  app.listen( '5000' , ()=>{
    console.log( 'Server is running on port 5000' );
} )
} )
