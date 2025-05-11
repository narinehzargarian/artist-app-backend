const jwt = require('jsonwebtoken');
const User = require('./user.js');

async function getFavorites (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({message: 'Please log in'});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({message: 'User does not exist'});

    // Sort the favorites in the newest-first order
    res.json({favorites: [...user.favorites].sort((a, b) => b.dateAdded - a.dateAdded)})
  }
  catch (error) {
    res.json({error: 'Error retrieving favorites', details: error.message});
  }
}

async function addFavorite (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({message: 'Please log in'});

    // Get user Id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({message: 'User does not exist'});

    // Add the favorite to the list
    const { artistID } = req.body;
    if (!artistID) return res.status(400).json({error: 'Artist ID is required'})

    // Verify that the artist is not added to the favorites
    const isLiked = user.favorites.some(fav => fav.artistID === artistID);
    if (!isLiked) user.favorites.unshift({artistID, dateAdded: Date.now()});

    await user.save();
    
    // Sort the favorites in the newest-first order
    res.json({
      message: 'Artist added to favorites', 
      favorites: user.favorites,
    })
  }
  catch (error) {
    res.json({error: 'Error adding artist to favorites', details: error.message});
  }
}

async function removeFavorite (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) res.status(401).json({message: 'Please log in'});

    // Extract user id from the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) res.status(401).json({message: 'User does not exist'});

    const { artistID } = req.body;
    if (!artistID) return res.status(400).json({error: 'Artist does not exit'});

    // Remove the favorite
    user.favorites = user.favorites.filter(fav => fav.artistID !== artistID);
    await user.save();
    
    res.json({
      message: 'Artist successfully removed', 
      favorites: user.favorites,
    });
  }
  catch (error) {
    res.json({error: 'Error removing artist from favorites'});
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite};

