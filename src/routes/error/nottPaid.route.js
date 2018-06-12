'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const NotPaidController = require('../../controllers/error/notPaid.controller')
const controller = new NotPaidController({route: Constants.Routes.NOT_PAID})

module.exports = Route.register('GET', controller)
