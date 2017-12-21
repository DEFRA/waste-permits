'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const ContactDetailsController = require('../controllers/contactDetails.controller')
const ContactDetailsValidator = require('../validators/contactDetails.validator')
const controller = new ContactDetailsController(Constants.Routes.CONTACT_DETAILS)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, new ContactDetailsValidator())
module.exports = route.register()
