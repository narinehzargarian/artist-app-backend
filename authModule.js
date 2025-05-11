const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./user.js');
const getGravatarUrl = require('./gravatar.js');

async function register (req, res) {
  try {
    const { fullname, email, password } = req.body;

    let user = await User.findOne({ email }); // Ensure the email is unique
    if (user) return res.status(400).json({error: 'The email is already registered'});

    const encryptedPassword = await bcrypt.hash(password, 10);

    // Generate the profile image
    const profileImage = getGravatarUrl(email);

    user = new User({
      fullname, 
      email, 
      password: encryptedPassword, 
      profileImageUrl: profileImage,
      favorites: [],
    });
    await user.save();

    // Generate cookie
    const token = jwt.sign({id: user._id }, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.cookie('token', token, {httpOnly: true, maxAge: 3600000 });

    res.json({ message: 'User is registered.', 
      token,
      user: {
        fullname: user.fullname, 
        email: user.email, 
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites,
      }
    });
  }
  catch (error) {
    console.error('Error: ', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({error: 'Invalid Input', details: error.message});
    }
    res.status(500).json({error: 'Error registering the user', details: error.message});
  }
  
}

async function login (req, res) {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({email})
    if (!user) {
      console.log('User not found');
      return res.status(400).json({error: 'Password or email is incorrect.'});
    }
  
    let isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) return res.status(400).json({error: 'Password or email is incorrect.'});
  
    // Generate token
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.cookie('token', token, {httpOnly: true, maxAge: 3600000})

    res.json({
      message: 'Login successful', 
      token, 
      user: {
        fullname: user.fullname, 
        email: user.email, 
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites,
      }}); // Return user data
  }
  catch (error) {
    console.error('Error: ', error.message);
    res.json({error: 'Problem logging in.', details: error.message});
  }
}

function logout (req, res) {
  try {
    // console.log('Recieved cookies', req.cookies);
    // Check if the token exist
    if (!req.cookies.token) {
      return res.status(400).json({error: 'User is already logged out'})
    }   
    res.clearCookie('token', {httpOnly: true, sameSite: 'lax'});
    res.json({message: 'Logout Successful'});
  }
  catch (error) {
    res.json({error: 'Error logging out', details: error.message});
  }
}

async function deleteUser (req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({message: 'Please log in'})
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded token: ', decoded);
    
    // Delete the user
    const user = await User.findByIdAndDelete(decoded.id);
    if (!user) return res.status(400).json({message: 'User does not exist'});

    res.clearCookie('token');

    res.json({message: 'Account deleted successfully'});
  }
  catch (error) {
    res.json({error: 'Error deleting the user', details: error.message});
  }
}

async function status(req, res) {

  try {
    const token = req.cookies.token;
    if (!token) {
      console.log("Token is invalid")
      return res.status(401).json({message: 'Please log in'});
    }
  
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("User not found")
      return res.status(401).json({message: 'Please log in'});
    }
  
    console.log("User found")
    res.json({
      message: "OK",
      token,
      user: {
        fullname: user.fullname, 
        email: user.email, 
        profileImageUrl: user.profileImageUrl,
        favorites: user.favorites
      }     
    });
    
  } 
  catch (error) {
    res.json({error: 'Error refreshing the page', details: error.message});
  }

}

module.exports = { register, login, logout, deleteUser, status};