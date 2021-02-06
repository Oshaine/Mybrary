const mongoose = require('mongoose')
const Book = require('./book')
// Database Schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})

//run a method before an action
authorSchema.pre('remove', function (next) {
    //finds a book with this author id
    Book.find({ author: this.id }, (err, books) => {
        if (err) {
            next(err)
        } else if (books.length > 0) {
            // do not remove author
            next(new Error('This author has a book'))
        } else {
            next()
        }
    })
})
module.exports = mongoose.model('Author', authorSchema)