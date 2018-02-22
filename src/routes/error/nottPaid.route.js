'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const NotPaidController = require('../../controllers/error/notPaid.controller')
const controller = new NotPaidController(Constants.Routes.ERROR.NOT_PAID, undefined, true)

module.exports = Route.register('GET', controller)
