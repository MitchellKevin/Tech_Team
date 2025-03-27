// dotenv
require('dotenv').config();

//axios (voor fetch)
const axios = require('axios')

// express
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8001;
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
    res.render('signUp.ejs');
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
      const database = client.db(process.env.db_name);
      const usersCollection = database.collection('users');
      
      const newUser = {
          name: req.body.name,
          surname: req.body.surname,
      };
      // await usersCollection.deleteMany({});
      await usersCollection.insertOne(newUser);
      console.log('New user inserted:', newUser);
      res.render('user.ejs', { data: newUser });
  } catch (error) {
      console.error('Error inserting new user:', error);
      res.status(500).send('Error inserting new user');
  }
});