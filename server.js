// dotenv
require('dotenv').config();

// express
const express = require('express');
const app = express ();
const port = 8000;
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.listen(port, () => {
  console.log('Server is running on port 8000');
});

app.use('/static', express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app
  .set('view engine', 'ejs')
  .set('views', 'view')

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/login', function(req, res) {
    res.render('logIn.ejs');
});

app.get('/signup', function(req, res) {
    res.render('signUp.ejs');
});

// mongodb
const {MongoClient, ObjectId, Collection} = require ("mongodb");
const uri = process.env.URI;

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

    console.log(req.file);

    // Hash het wachtwoord met bcrypt
    const saltRounds = 10; // Hoeveelheid hashing-rondes (10 is standaard en veilig)
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = {
      name: req.body.name,
      password: hashedPassword, // Sla de gehashte versie op!
      avatar: req.file.avatar
    };

    await usersCollection.deleteMany({}); // Verwijder alle gebruikers (voor testdoeleinden, waarschijnlijk niet gewenst in productie)
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
      console.log("User authenticated");
      res.status(200).send("Login successful");
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

app.post('/photos/upload', upload.array('photos', 12), (req, res, next) => {
  console.log(req.files);
  res.send('Files uploaded');
});

const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);
app.post('/cool-profile', cpUpload, (req, res, next) => {
  console.log(req.files);
  console.log(req.body);
  res.send('Files uploaded');
});

// app.post('/login', async (req, res) => {
//   try {
//       const database = client.db(process.env.db_name);
//       const usersCollection = database.collection('users'); 
//       const user = await usersCollection.findOne({
//           name: req.body.name
//       });
//       if (user) {
//           console.log('User found:', user);
//           if (user.password === encryptWithSecretKey(req.body.password)) {
//               console.log('User logged in:', user);
//           } else {
//               console.log('Invalid password');
//           }
//       }
//   } catch (error) {
//       console.error('Error finding user:', error);
//       res.status(500).send('Error finding user');
//   }
// });


// async function findUser(userName) {
//   try {
//     const database = client.db(process.env.db_name);
//     const usersCollection = database.collection('users');
//     const user = await usersCollection.findOne({
//       name: userName
//     });
//     console.log('User found:', user);
//     return user;
//   } catch (error) {
//     console.error('Error finding user:', error);
//   }
// }


// Encryption and decryption functions

// async function hashPassword(text) {
//   const saltRounds = 10;
//   return await bcrypt.hash(text, saltRounds);
// }


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


// const decryptWithSecretKey = (encryptedText) => {
//   try {
//     const fullCipher = CryptoJS.enc.Base64.parse(encryptedText);

//     // Extract IV and ciphertext from the parsed cipher
//     const iv = CryptoJS.lib.WordArray.create(fullCipher.words.slice(0, 4), 16);
//     const ciphertext = CryptoJS.lib.WordArray.create(fullCipher.words.slice(4));

//     const cipherParams = CryptoJS.lib.CipherParams.create({
//       ciphertext: ciphertext,
//     });

//     // Fetch and parse the secret key from environment variables
//     const secretKey = process.env.security_key?.replace(
//       /\\n/g,
//       "\n"
//     );

//     // Decrypt the ciphertext using AES and the provided secret key
//     const decrypted = CryptoJS.AES.decrypt(
//       cipherParams,
//       CryptoJS.enc.Hex.parse(secretKey),
//       {
//         iv: iv,
//         padding: CryptoJS.pad.Pkcs7,
//         mode: CryptoJS.mode.CBC,
//       }
//     );

//     // Return decrypted text in UTF-8 format
//     decrypted = decrypted.toString(CryptoJS.enc.Utf8);
//     console.log("Decrypted text:", decrypted);
//     return decrypted;
//   } catch (error) {
//     console.error("Decryption error:", error);
//     return;
//   }
// };
