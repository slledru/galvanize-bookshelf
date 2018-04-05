'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const userTable = 'users'

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const decoded = jwt.decode(token)
    knex(userTable)
      .select(['email', 'first_name', 'id', 'last_name'])
      .where('email', decoded.data)
      .then((rows) => {
        if (rows.length === 1) {
          res.status(200).json(true)
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
    res.status(200).json(false)
  }
})

router.post('/', (req, res, next) => {
  const { email, password } = req.body
  if (!password) {
    next(boom.badRequest('Password must not be blank'))
  }
  else if (password.length < 8) {
    next(boom.badRequest('Password must be at least 8 characters long'))
  }
  else if (!email) {
    next(boom.badRequest('Email must not be blank'))
  }
  else {
    knex(userTable)
      .select('*')
      .where('email', email)
      .then((rows) => {
        if (rows.length === 1) {
          return rows[0]
        }
        else {
          next(boom.badRequest('Bad email or password'))
        }
      })
      .then((record) => {
        if (record) {
          bcrypt.compare(password, record.hashed_password, (err, result) => {
            if (err) {
              next(boom.badImplementation())
            }
            else {
              if (result) {
                const token = jwt.sign({ data: email }, password)
                const toSend = { email: record.email,
                  first_name: record.first_name,
                  last_name: record.last_name,
                  id: record.id
                }
                res.setHeader('Set-Cookie', `token=${token}; Path=\/; HttpOnly`)
                
                res.status(200).json(humps.camelizeKeys(toSend))
              }
              else {
                next(boom.badRequest('Bad email or password'))
              }
            }
          })
        }
        else {
          next(boom.badRequest('Bad email or password'))
        }
      })
      .catch((err) => next(err))
  }
})

router.delete('/', (req, res, next) => {
  res.setHeader('Set-Cookie', `token=; Path=\/; HttpOnly`)
  res.status(200).json(true)
})

module.exports = router
