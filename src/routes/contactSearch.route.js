'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const ContactSearchController = require('../controllers/contactSearch.controller')
const controller = new ContactSearchController(Constants.Routes.CONTACT_SEARCH)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller)
module.exports = route.register()
