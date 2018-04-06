const express = require('express')
const knex = require('../knex')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const userTable = 'users'

function isAuthorized(req, res, next) {
  const token = req.cookies.token
  if (token) {
    const decoded = jwt.decode(token)
    knex(userTable)
      .select(['id'])
      .where('email', decoded.data)
      .then((rows) => {
        if (rows.length === 1) {
          req.userId = rows[0].id
          next()
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
    next(boom.unauthorized())
  }
}

module.exports = isAuthorized
