'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const PostcodeController = require('../controllers/postcode.controller')
const PostcodeValidator = require('../validators/postcode.validator')
const controller = new PostcodeController(Constants.Routes.POSTCODE)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new PostcodeValidator())
module.exports = route.register()
