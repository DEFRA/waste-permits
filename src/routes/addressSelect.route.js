'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const AddressSelectController = require('../controllers/addressSelect.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectController(Constants.Routes.ADDRESS_SELECT)

module.exports = Route.register('GET, POST', controller, validator)
