// dotenv
require('dotenv').config();

//axios (voor fetch)
const axios = require('axios')

// express
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
app.use(express.static('static'));
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const store = new session.MemoryStore();
const jwt = require('jsonwebtoken');

app.listen(port, () => {
  console.log('Server is running on port 8000');
});

app.use('/static', express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app
  .set('view engine', 'ejs')
  .set('views', 'view')

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.session_key,
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 // 1 uur
  }
}));

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/fav', function(req, res) {
  res.render('fav');
});

app.get('/search', function(req, res) {
    res.render('search');
});

app.get('/login', function(req, res) {
  res.render('logIn');
});

app.get('/signup', function(req, res) {
    res.render('signUp');
});

app.get('/searchResult', function(req, res) {
  res.render('pages/searchResult');
});

app.get('/quiz', function(req,res){
  res.render('pages/quiz.ejs');// dotenv
});

app.get('/details', function(req, res) {
  res.render('pages/details.ejs');
});

app.get('/details', function(req, res) {
  res.render('pages/matchpersoon.ejs');
});

app.get('/locaties', async function(req, res){
  const dataString = await travelguideapi(); // fetch de api data uit de travelguideapi functie als je dataString variable aanroept
  res.render('pages/locaties' , { dataString: dataString })
});

//travel guide api
const host = process.env.API_HOST;/*roep de api host aan in de dot env file*/
const apikey = process.env.API_KEY;/*roep de api key aan in de dot env file*/
const options = {
    method: "POST",
    url: 'https://travel-guide-api-city-guide-top-places.p.rapidapi.com/check',
params: {noqueue: '1'},
    headers: {
        'x-rapidapi-host': host,
        'x-rapidapi-key': apikey,
        'Content-Type': 'application/json'
      },
    data: {
        region: 'London',
        language: 'en',
        interests: [
          'historical',
          'cultural',
          'food'
        ]
    }
};

async function travelguideapi(){ /*request gespecificerde data en return naar een json*/
        try{
            const response = await axios.request(options);
            console.log(response.data);
            return JSON.stringify(response.data);
        }catch(error){
            console.error(error)
        }
    }

app.get('/quizresult', function(req, res) {
  res.render('pages/quizResult.ejs');
});

// mongodb
const { MongoClient, ObjectId, Collection } = require("mongodb");
const uri = process.env.URI;

const client = new MongoClient(uri);
const db = client.db(process.env.DB_NAME);

function authentiacteToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).send("Access denied");

  jwt.verify(token, process.env.session_key, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
}

// function authentiacteToken(req, res, next) {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).send("Access denied");

//   jwt.verify(token, process.env.session_key, (err, user) => {
//     if (err) return res.status(403).send("Invalid token");
//     req.user = user;
//     next();
//   });
// }

function valiadateCookie(req, res, next) {
  const { cookies } = req;
  if ("session_id" in cookies) {
    console.log("Cookie found:", cookies.session_id);
    if (cookies.session_id === req.sessionID) {
      console.log("Session authenticated");
      next();
    } else {
      res.status(401).send("Invalid session_id");
    }
  } else {
    res.status(401).send("No session_id cookie found");
  }
}

// mongodb connection
async function connectDB() {
  try {
    await client.connect();
    console.log("Client connected to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
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

    // fs.writeFileSync("users.json", JSON.stringify(usersArray, null, 2), "utf-8");

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

    const user = await usersCollection.findOne({ name: req.body.name });

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    // Vergelijk het ingevoerde wachtwoord met de opgeslagen hash
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (isMatch) {
      console.log(req.sessionID);
      console.log("User authenticated");
      const token = jwt.sign({ name: user.name }, process.env.session_key, { expiresIn: "1h" });
      req.session.user = user;
      req.session.authenticated = true;
      res.cookie('session_id', req.sessionID, { maxAge: 1000 * 60 * 60 });
      res.status(200).json({ token });
      console.log(token);
    } else {
      console.log("Incorrect password");
      res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Error finding user");
  }
});

app.post("/fav", valiadateCookie, async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    
    const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user._id) });

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    const { fav, checked } = req.body;
    let favs = user.fav || [];

    if (checked) {
      // Add to favorites if checked
      if (!favs.includes(fav)) {
        favs.push(fav);
      }
    } else {
      // Remove from favorites if unchecked
      favs = favs.filter(item => item !== fav);
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $set: { fav: favs } }
    );

    res.json({ message: "Favorites updated successfully" });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ message: "Error updating favorites" });
  }
});

app.post('/profile', upload.single('avatar'), (req, res, next) => {
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
  } else {
    res.render('dashboard', { user: req.session.user });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.send("Je bent uitgelogd.");
  });
});

// https://dev.to/shubhamkhan/beginners-guide-to-aes-encryption-and-decryption-in-javascript-using-cryptojs-592
const encryptWithSecretKey = (text) => {
  const secretKey = process.env.SECURITY_KEY?.replace(/\\n/g, "\n");

  // Generate a random Initialization Vector (IV) for security
  const iv = CryptoJS.lib.WordArray.random(16);

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
