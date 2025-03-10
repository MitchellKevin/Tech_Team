// dotenv
require('dotenv').config();

// express
const express = require('express');
const app = express ();
const port = 8000;
const CryptoJS = require("crypto-js");

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

app.post('/user', async (req, res) => {
  try {
      const database = client.db(process.env.db_name);
      const usersCollection = database.collection('users');
      encryptedPW= encryptWithSecretKey(req.body.password);
      setTimeout(() => {
        console.log('decryptedPW:', decryptedPW);
      }, 1000);
      decryptedPW = decryptWithSecretKey(encryptedPW);
      const newUser = {
          name: req.body.name,
          password: encryptedPW,
          password2: decryptedPW
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

// https://dev.to/shubhamkhan/beginners-guide-to-aes-encryption-and-decryption-in-javascript-using-cryptojs-592
const encryptWithSecretKey = (text) => {
  const secretKey = process.env.security_key?.replace(/\\n/g, "\n");

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