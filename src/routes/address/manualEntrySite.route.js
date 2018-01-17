'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const AddressManualSiteController = require('../../controllers/address/addressManualSite.controller')
const AddressManualValidator = require('../../validators/address/addressManual.validator')
const validator = new AddressManualValidator()
const controller = new AddressManualSiteController(Constants.Routes.ADDRESS.MANUAL_SITE)

module.exports = Route.register('GET, POST', controller, validator)
