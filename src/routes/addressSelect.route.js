'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const AddressSelectController = require('../controllers/addressSelect.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const validator = new AddressSelectValidator()
const controller = new AddressSelectController(Constants.Routes.ADDRESS_SELECT)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
