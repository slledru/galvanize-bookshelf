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
    const key = cookieKeys[0]
    const decoded = jwt.decode(req.cookies[key])
    res.status(200).json(key === decoded)
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
          next(boom.badRequest('Email must be unique'))
        }
      })
      .then((record) => {
        const token = jwt.sign({ data: email }, password)
        res.setHeader('Set-Cookie', `token=${token}; Path=\/; HttpOnly`)
        res.status(200).json(humps.camelizeKeys(record))
      })
  }
})

router.delete('/', (req, res, next) => {
  console.log('cookies', req.cookies)
  console.log('delete body', req.body)
  const { email, password } = req.body
  if (!email) {
    next(boom.badRequest('Email must not be blank'))
  }
  else {
    console.log('cookies', req.cookies)
    console.log('delete', req.body)
  }
})

module.exports = router
