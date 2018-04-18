'use strict'

const Constants = require('../../../constants')
const Route = require('../../baseRoute')
const AddressManualSiteController = require('../../../controllers/address/site/addressManualSite.controller')
const AddressManualValidator = require('../../../validators/address/addressManual.validator')
const validator = new AddressManualValidator()
const controller = new AddressManualSiteController({route: Constants.Routes.ADDRESS.MANUAL_SITE, validator})

module.exports = Route.register('GET, POST', controller, validator)
