// dotenv
require('dotenv').config();

// express
const express = require('express');
const app = express ();
const port = 8000;

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