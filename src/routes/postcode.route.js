'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PostcodeController = require('../controllers/postcode.controller')
const PostcodeValidator = require('../validators/postcode.validator')
const validator = new PostcodeValidator()
const controller = new PostcodeController(Constants.Routes.POSTCODE)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
