'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ContactSearchController = require('../controllers/contactSearch.controller')
const controller = new ContactSearchController(Constants.Routes.CONTACT_SEARCH)

module.exports = Route.register('GET, POST', controller)
