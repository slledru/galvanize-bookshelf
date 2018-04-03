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
    console.log('post', req.body)
    const token = jwt.sign(email, password)
    res.cookie(email, token)
    //console.log(res);
    res.sendStatus(200)
  }
})

router.delete('/', (req, res, next) => {
  const { email, password } = req.body
  if (!email) {
    next(boom.badRequest('Email must not be blank'))
  }
  else {
    console.log('delete', req.body)
  }
})

module.exports = router
