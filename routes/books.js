'use strict';

const express = require('express')
const knex = require('../knex')
const bookTable = 'books'

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  knex('books')
    .then((rows) => {
      console.log(rows)
      res.type('json')
      res.json({ data: rows })
    })
    .catch((err) => console.log(err))
})

router.get('/:id', (req, res, next) => {
  const { id } = req.params

  knex(bookTable)
    .where('id', id)
    .then((rows) => {
      res.type('json')
      res.json({ data: rows })
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
