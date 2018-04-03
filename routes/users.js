'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const bcrypt = require('bcrypt')
const saltRounds = 10
const userTable = 'users'

// eslint-disable-next-line new-cap
const router = express.Router()

router.post('/', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body
  if (!firstName) {
    next(boom.badRequest('First name must not be blank'))
  }
  else if (!lastName) {
    next(boom.badRequest('Last name must not be blank'))
  }
  else if (!password) {
    next(boom.badRequest('Password must not be blank'))
  }
  else {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        next(boom.badImplementation())
      }
      else {
        const first_name = humps.camelizeKeys(firstName)
        const last_name = humps.camelizeKeys(lastName)
        const hashed_password = hash
        knex(userTable)
          .insert({
            first_name, last_name, email, hashed_password
          })
          .returning(['first_name', 'last_name', 'email', 'id'])
          .then((rows) => {
            if (rows.length > 0) {
              res.json(humps.camelizeKeys(rows[0]))
            }
            else {
              next(boom.notFound())
            }
          })
          .catch((ex) => next(boom.badImplementation()))
      }
    })
  }
})

module.exports = router
