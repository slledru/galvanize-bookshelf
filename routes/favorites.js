'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const jwt = require('jsonwebtoken')
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
  const { token } = req.cookies
  if (token) {
    const decoded = jwt.decode(token)
    knex(userTable)
      .select(['id'])
      .where('email', decoded.data)
      .then((rows) => {
        if (rows.length === 1) {
          knex(favoriteTable)
            .select(columns)
            .innerJoin(bookTable, 'books.id', 'favorites.book_id')
            .innerJoin(userTable, 'users.id', 'favorites.user_id')
            .where('users.id', rows[0].id)
            .then((favs) => res.json(favs))
        }
        else {
          next(boom.badRequest('Email must be unique'))
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
  else {
    next(boom.unauthorized())
  }
})

router.get('/check', (req, res, next) => {
  const { bookId } = req.query
  const { token } = req.cookies
  if (token) {
    const decoded = jwt.decode(token)
    knex(userTable)
      .select(['id'])
      .where('email', decoded.data)
      .then((rows) => {
        if (rows.length === 1) {
          knex(favoriteTable)
            .where('book_id', bookId)
            .then((favs) => {
              if (favs.length > 0) {
                res.json(true)
              }
              else {
                next(boom.notFound())
              }
            })
            .catch((err) => {
              //console.log('err1', err)
              next(boom.badRequest('Book ID must be an integer'))
            })
        }
        else {
          next(boom.badRequest('Email must be unique'))
        }
      })
      .catch((err) => {
        console.log('err2', err)
      })
  }
  else {
    next(boom.unauthorized())
  }
})

router.post('/', (req, res, next) => {
  const { bookId } = req.body
  if (bookId) {
    const { token } = req.cookies
    if (token) {
      const decoded = jwt.decode(token)
      knex(userTable)
        .select(['id'])
        .where('email', decoded.data)
        .then((rows) => {
          if (rows.length === 1) {
            knex(favoriteTable)
              .insert([{ book_id: bookId, user_id: rows[0].id }])
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
            next(boom.badRequest('Email must be unique'))
          }
        })
        .catch((err) => {
          console.log(err)
        })
    }
    else {
      next(boom.unauthorized())
    }
  }
  else {
    next(boom.badRequest())
  }
})

router.delete('/', (req, res, next) => {
  const { bookId } = req.body
  if (bookId) {
    const { token } = req.cookies
    if (token) {
      const decoded = jwt.decode(token)
      knex(userTable)
        .select(['id'])
        .where('email', decoded.data)
        .then((rows) => {
          if (rows.length === 1) {
            knex(favoriteTable)
              .del()
              .returning(['book_id', 'user_id'])
              .where({ book_id: bookId, user_id: rows[0].id})
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
            next(boom.badRequest('Email must be unique'))
          }
        })
        .catch((err) => {
          console.log('delete err2', err)
        })
    }
    else {
      next(boom.unauthorized())
    }
  }
  else {
    next(boom.badRequest())
  }
})

module.exports = router
