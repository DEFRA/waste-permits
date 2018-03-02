'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PageNotFoundController = require('../../controllers/error/pageNotFound.controller')
const controller = new PageNotFoundController(Constants.Routes.ERROR.PAGE_NOT_FOUND, undefined)

module.exports = Route.register('GET', controller)
