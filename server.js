// dotenv
require('dotenv').config();

//axios
const axios = require('axios')

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
    res.render('signUp');
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