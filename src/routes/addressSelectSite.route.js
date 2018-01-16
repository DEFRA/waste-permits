'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const AddressSelectSiteController = require('../controllers/addressSelectSite.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectSiteController(Constants.Routes.ADDRESS_SELECT_SITE)

module.exports = Route.register('GET, POST', controller, validator)
