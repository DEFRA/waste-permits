'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const AddressSelectController = require('../controllers/addressSelect.controller')
const AddressSelectValidator = require('../validators/addressSelect.validator')
const controller = new AddressSelectController(Constants.Routes.ADDRESS_SELECT)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new AddressSelectValidator())
module.exports = route.register()
