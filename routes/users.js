'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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
  else if (!password || password.length < 8) {
    next(boom.badRequest('Password must be at least 8 characters long'))
  }
  else if (!email) {
    next(boom.badRequest('Email must not be blank'))
  }
  else {
    bcrypt.genSalt(saltRounds, (err1, salt) => {
      if (err1) {
        next(boom.badImplementation())
      }
      else {
        bcrypt.hash(password, salt, (err2, hash) => {
          if (err2) {
            next(boom.badImplementation())
          }
          else {
            const first_name = humps.decamelizeKeys(firstName)
            const last_name = humps.decamelizeKeys(lastName)
            const hashed_password = hash
            knex(userTable)
              .insert({
                first_name, last_name, email, hashed_password
              })
              .returning(['first_name', 'last_name', 'email', 'id'])
              .then((rows) => {
                if (rows.length > 0) {
                  return rows[0]
                }
                else {
                  next(boom.notFound())
                }
              })
              .then((row) => {
                const token = jwt.sign({ data: email }, process.env.JWT_KEY)
                res.setHeader('Set-Cookie', `token=${token}; Path=\/; HttpOnly`)
                res.json(humps.camelizeKeys(row))
              })
              .catch((ex) => {
                /* eslint-disable */
                if (ex.code == 23505) {
                  next(boom.badRequest('Email already exists'))
                }
                else {
                  next(boom.badImplementation())
                }
                /* eslint-enable */
              })
          }
        })
      }
    })
  }
})

module.exports = router
