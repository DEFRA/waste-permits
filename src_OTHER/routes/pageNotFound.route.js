'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PageNotFoundController = require('../controllers/pageNotFound.controller')
const controller = new PageNotFoundController(Constants.Routes.PAGE_NOT_FOUND, false)

module.exports = Route.register('GET', controller)
