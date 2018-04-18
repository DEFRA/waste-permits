'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const ContactDetailsController = require('../controllers/contactDetails.controller')
const ContactDetailsValidator = require('../validators/contactDetails.validator')

const validator = new ContactDetailsValidator()

const controller = new ContactDetailsController({route: Constants.Routes.CONTACT_DETAILS, validator})

module.exports = Route.register('GET, POST', controller, validator)
