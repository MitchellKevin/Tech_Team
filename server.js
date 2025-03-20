// dotenv
require('dotenv').config();

// express
const express = require('express');
const session = require('express-session');
const app = express ();
const port = 8000;
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

app.listen(port, () => {
  console.log('Server is running on port 8000');
});

app.use('/static', express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app
  .set('view engine', 'ejs')
  .set('views', 'view')

app.set('trust proxy', 1) 
app.use(session
  ({
    secret: process.env.session_key,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
    maxAge: 60000
  })
);

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/login', function(req, res) {
    res.render('logIn');
});

app.get('/signup', function(req, res) {
    res.render('signUp');
});

app.get('/dashboard', function(req, res) {
    res.render('dashboard');
});

// mongodb
const {MongoClient, ObjectId, Collection} = require ("mongodb");
const uri = process.env.uri;

// console.log("MongoDB URI:", uri);


const client = new MongoClient(uri);
const db = client.db(process.env.db_name);

// mongodb connection
async function connectDB() {
  try {
    await client.connect();
    console.log("Client connected to database");
  } catch (error) {
    console.log("error");
  }
}

connectDB();

app.post("/signup", upload.single('avatar'), async (req, res, next) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    const usersArray = await usersCollection.find({}).toArray();

    console.log(req.file);

    // Hash het wachtwoord met bcrypt
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = {
      name: req.body.name,
      password: hashedPassword, 
      avatar: req.file.path
    };

    
    fs.writeFileSync("users.json", JSON.stringify(usersArray, null, 2), "utf-8");

    // await usersCollection.deleteMany({}); 
    await usersCollection.insertOne(newUser);

    console.log("New user inserted:", newUser);
    res.render("user.ejs", { data: newUser });
  } catch (error) {
    console.error("Error inserting new user:", error);
    res.status(500).send("Error inserting new user");
  }
});

app.post("/login", async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    
    const user = await usersCollection.findOne({ name
      : req.body.name });

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    // Vergelijk het ingevoerde wachtwoord met de opgeslagen hash
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      console.log("User authenticated");
      res.status(200).send("Login successful");
      req.session.user = user;
    } else {
      console.log("Incorrect password");
      res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Error finding user");
  } 
});



app.post('/profile' , upload.single('avatar'), (req, res, next) => {
  console.log(req.file);
  // res.send('File uploaded');
});


const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }]);
app.post('/cool-profile', cpUpload, (req, res, next) => {
  console.log(req.files);
  console.log(req.body);
  res.send('Files uploaded');
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Je moet inloggen om dit te zien.");
  }
  else{
    res.send(`Welkom, ${req.session.user.username}!`);
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("Je bent uitgelogd.");
  });
});

// https://dev.to/shubhamkhan/beginners-guide-to-aes-encryption-and-decryption-in-javascript-using-cryptojs-592
const encryptWithSecretKey = (text) => {
  const secretKey = process.env.security_key?.replace(/\\n/g, "\n");

  // Generate a random Initialization Vector (IV) for security
  const iv = (16);

  // Encrypt the text using AES with CBC mode and the secret key
  const encrypted = CryptoJS.AES.encrypt(
    text,
    CryptoJS.enc.Hex.parse(secretKey),
    {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    }
  );

  // Concatenate IV and ciphertext and encode in Base64 format
  const encryptedBase64 = CryptoJS.enc.Base64.stringify(
    iv.concat(encrypted.ciphertext)
  );

  return encryptedBase64;
};
