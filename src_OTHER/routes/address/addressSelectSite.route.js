'use strict'

const Constants = require('../../constants')
const Route = require('../baseRoute')
const AddressSelectController = require('../../controllers/address/addressSelect.controller')
const AddressSelectValidator = require('../../validators/address/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectController(Constants.Routes.ADDRESS.SELECT_SITE)

module.exports = Route.register('GET, POST', controller, validator)
