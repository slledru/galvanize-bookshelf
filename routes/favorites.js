'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const isAuthorized = require('./auth')

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

router.use(isAuthorized)

router.get('/', (req, res, next) => {
  knex(favoriteTable)
    .select(columns)
    .innerJoin(bookTable, 'books.id', 'favorites.book_id')
    .innerJoin(userTable, 'users.id', 'favorites.user_id')
    .where('users.id', req.userId)
    .then((favs) => res.json(favs))
})

router.get('/check', (req, res, next) => {
  const { bookId } = req.query
  knex(favoriteTable)
    .where('book_id', bookId)
    .then((favs) => {
      res.json(favs.length > 0)
    })
    .catch((err) => {
      next(boom.badRequest('Book ID must be an integer'))
    })
})

router.post('/', (req, res, next) => {
  const { bookId } = req.body
  if (bookId) {
    knex(favoriteTable)
      .insert([{ book_id: bookId, user_id: req.userId }])
      .returning(['id', 'book_id', 'user_id'])
      .then((inserted) => {
        if (inserted.length === 1) {
          return inserted[0]
        }
        else {
          next(boom.badImplementation())
        }
      })
      .then((row) => humps.camelizeKeys(row))
      .then((camel) => res.json(camel))
      .catch((err) => {
        if (err.code === '22P02') {
          next(boom.badRequest('Book ID must be an integer'))
        }
        else if (err.code === '23503') {
          next(boom.notFound('Book not found'))
        }
        else {
          console.log('post err', err)
        }
      })
  }
  else {
    next(boom.badRequest())
  }
})

router.delete('/', (req, res, next) => {
  const { bookId } = req.body
  if (bookId) {
    knex(favoriteTable)
      .del()
      .returning(['book_id', 'user_id'])
      .where({ book_id: bookId, user_id: req.userId})
      .then((deleted) => {
        if (deleted.length === 1) {
          res.json(humps.camelizeKeys(deleted[0]))
        }
        else {
          next(boom.notFound('Favorite not found'))
        }
      })
      .catch((err) => {
        if (err.code === '22P02') {
          next(boom.badRequest('Book ID must be an integer'))
        }
        else if (err.code === '23503') {
          next(boom.notFound('Book not found'))
        }
        else {
          console.log('delete err', err)
        }
      })
  }
  else {
    next(boom.badRequest())
  }
})

module.exports = router
