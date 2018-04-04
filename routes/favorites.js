'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const favoriteTable = 'favorites'
const bookTable = 'books'
const userTable = 'users'

const columns = [
  'books.author as author',
  'books.cover_url as coverUrl',
  'books.created_at as createdAt',
  'books.description as description',
  'books.genre as genre',
  'books.title as title',
  'books.updated_at as updatedAt',
  'favorites.book_id as bookId',
  'favorites.user_id as userId',
  'favorites.id as id'
]

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  knex(favoriteTable)
    .select(columns)
    .innerJoin(bookTable, 'books.id', 'favorites.book_id')
    .then((rows) => res.json(rows))
})

router.get('/check', (req, res, next) => {
  const { bookId } = req.query
  knex(favoriteTable)
    .where('book_id', bookId)
    .then((rows) => {
      if (rows.length > 0) {
        res.json(true)
      }
      else {
        res.json(false)
      }
    })
    .catch((err) => res.json(false))
})

router.post('/', (req, res, next) => {

})

router.delete('/', (req, res, next) => {

})

module.exports = router
