'use strict'

const express = require('express')
const knex = require('../knex')
const humps = require('humps')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const userTable = 'users'

// eslint-disable-next-line new-cap
const router = express.Router()

router.get('/', (req, res, next) => {
  const cookieKeys = Object.keys(req.cookies)
  if (cookieKeys.length > 0) {
    const token = cookieKeys.reduce((acc, key) => {
      if (key === 'token') {
        return req.cookies[key]
      }
      return acc
    }, null)
    if (token !== null) {
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
  }
  else {
    res.status(200).json(false)
  }
})

router.post('/', (req, res, next) => {
  const { email, password } = req.body
  if (!password || password.length < 8) {
    next(boom.badRequest('Password must be at least 8 characters long'))
  }
  else if (!email) {
    next(boom.badRequest('Email must not be blank'))
  }
  else {
    knex(userTable)
      .select(['email', 'first_name', 'id', 'last_name'])
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
        const token = jwt.sign({ data: email }, password)
        res.setHeader('Set-Cookie', `token=${token}; Path=\/; HttpOnly`)
        res.status(200).json(humps.camelizeKeys(record))
      })
      .catch((err) => next(err))
  }
})

router.delete('/', (req, res, next) => {
  res.setHeader('Set-Cookie', `token=; Path=\/; HttpOnly`)
  res.sendStatus(200)
})

module.exports = router
