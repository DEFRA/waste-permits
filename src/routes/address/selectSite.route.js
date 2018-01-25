'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const AddressSelectSiteController = require('../../controllers/address/selectSite.controller')
const AddressSelectValidator = require('../../validators/address/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectSiteController(Constants.Routes.ADDRESS.SELECT_SITE, validator)

module.exports = Route.register('GET, POST', controller, validator)
