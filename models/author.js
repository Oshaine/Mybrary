const mongoose = require('mongoose')

// Database Schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Author', authorSchema)