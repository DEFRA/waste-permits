'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const ContactDetailsController = require('../controllers/contactDetails.controller')
const ContactDetailsValidator = require('../validators/contactDetails.validator')
const validator = new ContactDetailsValidator()
const controller = new ContactDetailsController(Constants.Routes.CONTACT_DETAILS)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
