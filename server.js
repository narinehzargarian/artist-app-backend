require('dotenv').config();
const mongoose = require('mongoose');
const  MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected!')
  }
  catch (error) {
    console.error('MongoDB Error: ', error.message);
    process.exit(1);
  }
}

connectMongo(); // Connect to DB

/** 
 * Endpoints of the app 
 **/
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { register, login, logout, deleteUser, status} = require('./authModule.js');
const { error } = require('console');
const cookieParser = require('cookie-parser');
const { getFavorites, addFavorite, removeFavorite } = require('./favoriteHandler.js');


const app = express();

// For development 
app.use(cors({
  origin: 'http://localhost:4200',
  //origin: true,
  credentials: true,
}));

// const corsOptions = {
//   origin: 'http://localhost:4200',
//   credentials: true,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
  
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const CLIENT_ID = '1491fc987e1c92484640';
const CLIENT_SECRET = '33e5f373e5ba65027ff0c6f517077e40';
const TOKEN_URL = 'https://api.artsy.net/api/tokens/xapp_token';
const API_URL = 'https://api.artsy.net/api';
const ARTIST_INFO_URL = 'https://api.artsy.net/api/artists';


let ACCESS_TOKEN = '';

// get the X_XAPP_TOKEN
async function getToken() {
  try {
    const response = await axios.post(TOKEN_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    });
    ACCESS_TOKEN = response.data.token;
    // console.log('Token: ', ACCESS_TOKEN);
  }
  catch (error) {
    console.error('Error fetching token: ', error.message);
  }
}

getToken();

// Search endpoint
app.get('/api/search', async (req, res) => {
  const artistName = req.query?.name?.trim();
  if (!artistName) return res.status(400).json({error: 'Artist name is required.'});
  
  let headers = { 
    'X-XAPP-Token': ACCESS_TOKEN,
    'Accept': 'application/json'};
  const searchUrl = `${API_URL}/search?q=${encodeURIComponent(artistName)}&size=10&type=artist`;
  
  try {
    let response = await axios.get(searchUrl, {headers});
    res.json(response.data);
    console.log('Results: ', response.data);
  } 
  catch (error) {
    if (error.response?.status === 401) { // Unauthoraized
      console.log('Token is expired.');
      await getToken();
      headers['X-XAPP-Token'] = ACCESS_TOKEN;
      response = await axios.get(searchUrl, {headers});
      // console.log('Results: ', response.data);
      return res.json(response.data);
    }
    console.error('Error: ', error.message);
  }
});

// Artist endpoint
app.get('/api/artist', async (req, res) => {
  const artistID = req.query.id?.trim();
  if (!artistID) return res.status(400).json({error: 'Artist ID is required.'})
  let headers = {
    'X-XAPP-Token': ACCESS_TOKEN,
    'Accept': 'application/json'
  };
  const searchUrl = `${ARTIST_INFO_URL}/${artistID}`

  try {
    let response = await axios.get(searchUrl, {headers});
    res.json(response.data);
    // console.log('Results: ', response.data);
  }
  catch (error) {
    if (error.response?.status === 401) {
      console.log('Token is expired');
      await getToken();
      headers['X-XAPP-Token'] = ACCESS_TOKEN;
      response = await axios.get(searchUrl, {headers});
      console.log('Results: ', response.data);
      return res.json(response.data);
    }
    console.error('Error: ', error.message);
  }
});

// Similar Artist endpoint 
app.get('/api/similar_artists', async(req, res) => {
  const artistID = req?.query?.artist_id;
  if (!artistID) return res.status(400).json({error: 'Artist ID is required'});

  let headers = {
    'X-XAPP-Token': ACCESS_TOKEN,
    'Accept': 'application/json'
  };

  const searchUrl = `${API_URL}/artists?similar_to_artist_id=${artistID}`;
  
  try {
    let response = await axios.get(searchUrl, {headers});
    res.json(response.data);
    // console.log('Results: ', response.data);
  }
  catch (error) {
    if (error.response?.status === 401) {
      console.log('Token is expired');
      await getToken();

      headers['X-XAPP-Token'] = ACCESS_TOKEN;
      response = await axios.get(searchUrl, {headers});
      // console.log('Results: ', response.data);
      return res.json(response.data);
    }
    console.error('Error: ', error.message);
  }
});

// Artoworks endpoint
app.get('/api/artworks', async (req, res) => {
  const artistID = req.query.artist_id?.trim();
  if (!artistID) return res.status(400).json({error: 'Artist ID is required.'}); // Bad Request

  let headers = {
    'X-XAPP-Token': ACCESS_TOKEN,
    'Accept': 'application/json'
  };

  const searchUrl = `${API_URL}/artworks?artist_id=${artistID}&size=10`;
  
  try {
    let response = await axios.get(searchUrl, {headers});
    res.json(response.data);
    console.log('Artworks: ', response.data);
  }
  catch (error) {
    if (error.response?.status === 401) {
      console.log('Token is expired');
      await getToken();
      headers['X-XAPP-Token'] = ACCESS_TOKEN;
      response = await axios.get(searchUrl, {headers});
      // console.log('Results: ', response.data);
      return res.json(response.data);
    }
    console.error('Error: ', error.message);
  }
});

// Genes endpoint
app.get('/api/genes', async (req, res) => {
  const artWorkID = req.query.artwork_id?.trim();
  if (!artWorkID) return res.status(400).json({error: 'Artwork ID is required.'}); 

  let headers = {
    'X-XAPP-Token': ACCESS_TOKEN,
    'Accept': 'application/json'
  };

  const searchUrl = `${API_URL}/genes?artwork_id=${artWorkID}`;

  try {
    let response = await axios.get(searchUrl, {headers});
    res.json(response.data);
    // console.log('Results: ', response.data);
  }
  catch (error) {
    if (error.response?.status === 401) {
      console.log('Token is expired');
      await getToken();
      headers['X-XAPP-Token'] = ACCESS_TOKEN;
      response = await axios.get(searchUrl, {headers});
      // console.log('Results: ', response.data);
      return res.json(response.data);
    }
    console.error('Error: ', error.message);
  }

});

/**
 * Authentication and account management
*/
app.post('/api/auth/login', login); // Login endpoint
app.post('/api/auth/logout', logout); // logout endpoint
app.get('/api/auth/status', status); // status endpoint

app.post('/api/users', register); // Registeration endpoint
app.delete('/api/users/me', deleteUser); // Delete user endpoint

/**
 * Favorite handling
*/
app.get('/api/favorites/get', getFavorites); // getFavorite endpoint
app.post('/api/favorites/add', addFavorite); // addFavorite endpoint
app.post('/api/favorites/remove', removeFavorite); //removeFavorite endpoint

// Serve the frontend
app.use(express.static(path.join(__dirname, 'artist-vault-frontend', 'dist', 'frontend', 'browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'artist-vault-frontend', 'dist', 'frontend', 'browser', 'index.html'));
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});