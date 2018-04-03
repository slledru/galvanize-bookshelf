'use strict';

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const bookTable = 'books'

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  knex('books')
    .then((rows) => {
      const sorted = rows
        .sort((a, b) => a.title.toUpperCase() > b.title.toUpperCase())
        .map((record) => humps.camelizeKeys(record))
      res.type('json')
      res.json(sorted)
    })
    .catch((err) => console.log(err))
})

router.get('/:id', (req, res, next) => {
  const { id } = req.params

  knex(bookTable)
    .where('id', id)
    .then((rows) => {
      res.type('json')
      res.json(humps.camelizeKeys(rows[0]))
    })
    .catch((err) => console.log(err))
})

router.post('/', (req, res, next) => {

})

router.patch('/:id', (req, res, next) => {

})

router.delete('/:id', (req, res, next) => {

})

module.exports = router
