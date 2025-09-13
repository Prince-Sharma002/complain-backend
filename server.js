import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { MongooseConnect } from './db/db.js';
import { userComplain } from './model/complain-schema.js';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
});

const app = express();

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5500/frontend/admin.html',
  'https://geo-mesh-front.vercel.app/admin',
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
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.post('/complain', upload.single('image'), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);
    
    const { name, description, address, phone, email } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    
    const newComplaint = await userComplain.create({
      name,
      description: description || '',
      address: JSON.parse(address) || [],
      image: imagePath,
      phone,
      email,
      progress: 1,
      pid: Date.now().toString(36) + Math.random().toString(36).substr(2)
    });
    
    return res.status(200).json({ 
      message: 'Complaint submitted successfully',
      data: newComplaint 
    });
  } catch (err) {
    console.error('Error in /complain:', err);
    return res.status(500).json({ 
      error: 'Error submitting complaint',
      details: err.message 
    });
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



MongooseConnect().then(()=>{
  app.listen( '4000' , ()=>{
    console.log( 'Server is running on port 4000' );
} )
} )