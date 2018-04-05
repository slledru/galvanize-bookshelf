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
              res.json(favs.length > 0)
            })
            .catch((err) => res.json(false))
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
              .catch((err) => next(err))
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
    knex(favoriteTable)
      .del()
      .where('book_id', bookId)
      .returning(['book_id', 'user_id'])
      .then((rows) => {
        if (rows.length === 1) {
          return rows[0]
        }
        else {
          next(boom.badImplementation())
        }
      })
      .then((row) => humps.camelizeKeys(row))
      .then((camel) => res.json(camel))
      .catch((err) => next(err))
  }
  else {
    next(boom.badRequest())
  }
})

module.exports = router
