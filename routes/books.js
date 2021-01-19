const express = require('express')
const author = require('../models/author')
const router = express.Router()
const path = require('path')
const fs = require('fs')
// Model
const Book = require('../models/book')
const Author = require('../models/author')

const uploadPath = path.join('public', Book.coverImagePath)
const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif']
const multer = require('multer')
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMineTypes.includes(file.mimetype))

    }
})



// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        //check if less than or equal to before published date
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        //check if less than or equal to fater published date
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }

})

// New Books Route

router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())

})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author.trim(),
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch (error) {

        if (book.coverImageName != null) {
            // remove book cover if error
            removeBookCover(book.coverImageName)

        } renderNewPage(res, book, true)
    }
})

// Remove book cover
function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = "Error Creating book"

        res.render('books/new', params);
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router