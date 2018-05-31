'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const PermitHolderDetailsController = require('../controllers/permitHolderDetails.controller')
const controller = new PermitHolderDetailsController({route: Constants.Routes.PERMIT_HOLDER_DETAILS})

module.exports = Route.register('GET', controller)
