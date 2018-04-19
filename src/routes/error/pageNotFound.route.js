'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const PageNotFoundController = require('../../controllers/error/pageNotFound.controller')
const controller = new PageNotFoundController({route: Constants.Routes.ERROR.PAGE_NOT_FOUND})

module.exports = Route.register('GET', controller)
