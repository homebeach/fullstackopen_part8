const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  favoriteGenre: {
    type: String,
    required: true // Ensure it's required in the Mongoose schema
  }
})

module.exports = mongoose.model('User', schema)