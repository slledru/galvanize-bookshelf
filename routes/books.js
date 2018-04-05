'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const bookTable = 'books'

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  knex(bookTable)
    .orderBy('title', 'asc')
    .then((rows) => rows.map((record) => humps.camelizeKeys(record)))
    .then((rows) => res.json(rows))
    .catch((err) => console.log(err))
})

router.get('/:id', (req, res, next) => {
  const { id } = req.params
  knex(bookTable)
    .where('id', id)
    .then((rows) => {
      if (rows.length > 0) {
        res.json(humps.camelizeKeys(rows[0]))
      }
      else {
        res.sendStatus(404)
      }
    })
    .catch((err) => res.sendStatus(404))
})

router.post('/', (req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { title, author, genre, description, coverUrl } = req.body
    if (!title) {
      next(boom.badRequest('Title must not be blank'))
    }
    else if (!author) {
      next(boom.badRequest('Author must not be blank'))
    }
    else if (!genre) {
      next(boom.badRequest('Genre must not be blank'))
    }
    else if (!description) {
      next(boom.badRequest('Description must not be blank'))
    }
    else if (!coverUrl) {
      next(boom.badRequest('Cover URL must not be blank'))
    }
    else {
      const cover_url = humps.decamelizeKeys(coverUrl)
      knex(bookTable)
        .insert({
          title, author, genre, description, cover_url
        })
        .returning('*')
        .then((rows) => {
          if (rows.length > 0) {
            res.json(humps.camelizeKeys(rows[0]))
          }
          else {
            res.sendStatus(404)
          }
        })
        .catch((err) => res.sendStatus(404))
    }
  }
  else {
    next(boom.unauthorized())
  }
})

router.patch('/:id', (req, res, next) => {
  const { id } = req.params
  const { token } = req.cookies
  if (token) {
    const { title, author, genre, description, coverUrl } = req.body
    const cover_url = humps.decamelizeKeys(coverUrl)
    knex(bookTable)
      .update({ title, author, genre, description, cover_url })
      .where('id', id)
      .returning('*')
      .then((rows) => {
        if (rows.length > 0) {
          res.json(humps.camelizeKeys(rows[0]))
        }
        else {
          next(boom.notFound())
        }
      })
      .catch((err) => next(boom.notFound()))
  }
  else {
    next(boom.unauthorized())
  }
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params
  const { token } = req.cookies
  if (token) {
    knex(bookTable)
      .del()
      .where('id', id)
      .returning(['author', 'title', 'description', 'cover_url', 'genre'])
      .then((rows) => {
        if (rows.length > 0) {
          res.json(humps.camelizeKeys(rows[0]))
        }
        else {
          res.sendStatus(404)
        }
      })
      .catch((err) => res.sendStatus(404))
  }
  else {
    next(boom.unauthorized())
  }
})

module.exports = router
