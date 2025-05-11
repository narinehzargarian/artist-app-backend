const mongoose = require('mongoose');

// User Schema for MongoDB
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true},
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true, // Store the email in lowercase 
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email address']},
  password: { type: String, required: true},
  profileImageUrl: { type: String},
  favorites: [{
    artistID: { type: String, required: true }, 
    dateAdded: { type: Date, default: Date.now}
  }]
});

const User = mongoose.model('User', userSchema, 'users'); 
module.exports = User;