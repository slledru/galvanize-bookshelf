'use strict';

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const bookTable = 'books'

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  knex('books')
    .then((rows) => rows.sort((a, b) => a.title.toUpperCase() > b.title.toUpperCase()))
    .then((rows) => rows.map((record) => humps.camelizeKeys(record)))
    .then((rows) => res.json(rows))
    .catch((err) => console.log(err))
})

router.get('/:id', (req, res, next) => {
  const { id } = req.params
  if (id) {
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
      .catch((err) => console.log(err))
  }
  else {
    res.sendStatus(404)
  }
})

router.post('/', (req, res, next) => {
  const { title, author, genre, description, coverUrl } = req.body
  if (title && author && genre && description && coverUrl) {
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
      .catch((err) => console.log(err))
  }
  else {
    res.sendStatus(400)
  }
})

router.patch('/:id', (req, res, next) => {
  const { id } = req.params
  const { title, author, genre, description, coverUrl } = req.body
  if (!title) {
    next({ status: 400, message: 'Title must not be blank' })
  }
  else if (!author) {
    next({ status: 400, message: 'Author must not be blank' })
  }
  else if (!genre) {
    next({ status: 400, message: 'Genre must not be blank' })
  }
  else if (!description) {
    next({ status: 400, message: 'Description must not be blank' })
  }
  else if (!coverUrl) {
    next({ status: 400, message: 'Cover URL must not be blank' })
  }
  else if (!id) {
    next({ status: 404, message: 'Id must not be blank' })
  }
  else {
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
          res.sendStatus(404)
        }
      })
      .catch((err) => console.log(err))
  }
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params
  if (!id) {
    next({ status: 404, message: 'Id must not be blank' })
  }
  else {
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
      .catch((err) => console.log(err))
  }
})

module.exports = router
