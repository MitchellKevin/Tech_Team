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
app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('static'));
app.use('/static', express.static('static'));
app.use('/static', express.static('static'));
app.use('/static', express.static('static'));
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

app.get('/', async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const destinationsCollection = database.collection("destinations");
    const usersCollection = database.collection("users");

    // Haal alle bestemmingen op uit de database
    const destinations = await destinationsCollection.find().toArray();

    // Haal de favorieten van de ingelogde gebruiker op
    let favorites = [];
    if (req.session.user) {
      const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user._id) });
      favorites = user.fav || [];
    }

    // Render de index pagina met bestemmingen en favorieten
    res.render('pages/index', { destinations, favorites });
  } catch (error) {
    console.error("Error fetching destinations or favorites:", error);
    res.status(500).send("Error fetching destinations or favorites");
  }
});

app.get('/fav', valiadateCookie, async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    // Retrieve the logged-in user's data
    const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user._id) });

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    // Pass the user's favorites to the template
    res.render("fav", { user: user, favorites: user.fav || [] });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    res.status(500).send("Error fetching user favorites");
  }
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const database = client.db(process.env.DB_NAME);
    const destinationsCollection = database.collection("destinations");

    const results = await destinationsCollection
      .find({ city: { $regex: query, $options: "i" } })
      .toArray();

    res.render("searchResults", { query, results });
  } catch (error) {
    console.error("Error handling search:", error);
    res.status(500).send("Error handling search");
  }
});

app.get('/login', function(req, res) {
  res.render('pages/logIn');
});

app.get('/signup', function(req, res) {
    res.render('pages/signUp');
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
  const cityData = await fetchdbdata("Amsterdam");
  const dataString = await travelguideapi(cityData); // fetch de api data uit de travelguideapi functie als je dataString variable aanroept
  res.render('pages/locaties' , { dataString: dataString })
});

app.get('/gids', async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const destinationsCollection = database.collection("destinations");

    // Haal alle bestemmingen op uit de database
    const destinations = await destinationsCollection.find().toArray();

    // Log de data om te controleren
    console.log(destinations);

    // Render de gids pagina met de bestemmingen
    res.render('pages/gids', { destinations });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).send("Error fetching destinations");
  }
});

//travel guide api
const host = process.env.API_HOST;/*roep de api host aan in de dot env file*/
const apikey = process.env.API_KEY;/*roep de api key aan in de dot env file*/

async function travelguideapi(cityData){ /*request gespecificerde data en return naar een json*/
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
        region: cityData.city ,
        language: 'en',
        interests: [
          'historical',
          'cultural',
          'food'
        ]
    }
};
  try{
      const response = await axios.request(options);
      console.log(response.data);
      return JSON.stringify(response.data);
  }catch(error){
      console.error(error)
  }
  console.log(options);
}

async function fetchdbdata(cityName) {
  try{
  const destinationCollection = db.collection("destinations");
  const cityData = await destinationCollection.findOne({city: cityName});
  return cityData;
  }catch (error){
    console.error(error)
  }
}


app.get('/quizresult', function(req, res) {
  res.render('pages/quizResult.ejs');
});

// mongodb
const { MongoClient, ObjectId, Collection } = require("mongodb");
const { json } = require('stream/consumers');
const { render } = require('ejs');
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
      tele: req.body.phone,
      avatar: req.file.path
    };

    // fs.writeFileSync("users.json", JSON.stringify(usersArray, null, 2), "utf-8");

    // await usersCollection.deleteMany({});
    await usersCollection.insertOne(newUser);
    res.render("dashboard.ejs", { user: newUser });
    console.log("New user inserted:", newUser);
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
      res.cookie("session_id", req.sessionID, { maxAge: 1000 * 60 * 60 });
      res.render("dashboard.ejs", { user: user});
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

app.post('/fav', async (req, res) => {
  try {
    const { city, checked } = req.body;

    // Controleer of de gebruiker is ingelogd
    const userId = req.session.user._id;
    if (!userId) {
      return res.status(401).json({ message: "Gebruiker niet ingelogd." });
    }

    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    if (checked) {
      // Voeg de stad toe aan de favorieten
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { fav: city } } // Voorkomt duplicaten
      );
    } else {
      // Verwijder de stad uit de favorieten
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { fav: city } }
      );
    }

    // Haal de bijgewerkte favorieten op
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    res.json({ favorites: user.fav });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het bijwerken van favorieten." });
  }
});

app.post("/fav/users", valiadateCookie, async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    const { favs } = req.body; 

    if (!Array.isArray(favs) || favs.length === 0) {
      return res.status(400).json({ message: "No favorites provided" });
    }

    // Find users who have all the selected favorites
    const usersWithFavorites = await usersCollection
      .find({ fav: { $all: favs } }) 
      .project({ name: 1, _id: 0 }) 
      .toArray();

    res.json({ users: usersWithFavorites });
  } catch (error) {
    console.error("Error fetching users with the same favorites:", error);
    res.status(500).json({ message: "Error fetching users with the same favorites" });
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
    return res.render("pages/logIn")
  } else {
    res.render('dashboard', { user: req.session.user, avvatar: req.session.user.path });
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

app.get("/friendlist", valiadateCookie, async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");
    const destinationCollection= database.collection("destinations");

    const destination= await destinationCollection.findOne({city: "Amsterdam"});
    const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user._id) });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Zoek gebruikers met dezelfde locatievoorkeuren, exclusief de huidige gebruiker
    const potentialMatches = await usersCollection
      .find({
        _id: { $ne: new ObjectId(req.session.user._id) },
        fav: { $in: user.fav },
        friends: { $ne: new ObjectId(req.session.user._id) }, 
        friendRequests: { $ne: new ObjectId(req.session.user._id) } 
      })
      .project({ name: 1, fav: 1, img: 1 }) //
      .toArray();

    res.render("friendlist", { user, potentialMatches, destination });
  } catch (error) {
    console.error("Error fetching friendlist:", error);
    res.status(500).send("Error fetching friendlist");
  }
});

app.post("/friendrequest", valiadateCookie, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    // Voeg de huidige gebruiker toe aan de friendRequests van de target user
    await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { $addToSet: { friendRequests: new ObjectId(req.session.user._id) } }
    );

    res.json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Error sending friend request" });
  }
});

app.post("/friendrequest/respond", valiadateCookie, async (req, res) => {
  try {
    const { requesterId, action } = req.body;

    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    if (action === "accept") {
      // Voeg de requester toe aan de vriendenlijst
      await usersCollection.updateOne(
        { _id: new ObjectId(req.session.user._id) },
        {
          $addToSet: { friends: new ObjectId(requesterId) },
          $pull: { friendRequests: new ObjectId(requesterId) } 
        }
      );

      // Voeg de huidige gebruiker toe aan de vriendenlijst van de requester
      await usersCollection.updateOne(
        { _id: new ObjectId(requesterId) },
        { $addToSet: { friends: new ObjectId(req.session.user._id) } }
      );
    } else if (action === "reject") {
      // Verwijder de requester uit de friendRequests
      await usersCollection.updateOne(
        { _id: new ObjectId(req.session.user._id) },
        { $pull: { friendRequests: new ObjectId(requesterId) } }
      );
    }

    res.json({ message: `Friend request ${action}ed successfully` });
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ message: "Error responding to friend request" });
  }
});

app.get("/friends", valiadateCookie, async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user._id) });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Haal de vrienden op
    const friends = await usersCollection
      .find({ _id: { $in: user.friends } })
      .project({ name: 1 })
      .toArray();

    res.render("friends", { user, friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).send("Error fetching friends");
  }
});

app.post("/delete-account", valiadateCookie, async (req, res) => {
  try {
    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    // Verwijder de gebruiker uit de database
    await usersCollection.deleteOne({ _id: new ObjectId(req.session.user._id) });

    // Vernietig de sessie
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).send("Er is een fout opgetreden bij het verwijderen van je account.");
      }

      // Stuur een bevestiging naar de gebruiker
      res.send("Je account is succesvol verwijderd.");
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send("Er is een fout opgetreden bij het verwijderen van je account.");
  }
});

app.post("/change-password", valiadateCookie, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).send("Het nieuwe wachtwoord komt niet overeen met de bevestiging.");
    }

    const database = client.db(process.env.DB_NAME);
    const usersCollection = database.collection("users");

    // Vind de huidige gebruiker
    const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user._id) });

    if (!user) {
      return res.status(404).send("Gebruiker niet gevonden.");
    }

    // Controleer of het huidige wachtwoord correct is
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).send("Huidig wachtwoord is onjuist.");
    }

    // Hash het nieuwe wachtwoord
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update het wachtwoord in de database
    await usersCollection.updateOne(
      { _id: new ObjectId(req.session.user._id) },
      { $set: { password: hashedPassword } }
    );

    res.send("Wachtwoord succesvol gewijzigd.");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Er is een fout opgetreden bij het wijzigen van je wachtwoord.");
  }
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
