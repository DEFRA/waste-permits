'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const SiteNameController = require('../controllers/siteName.controller')
const SiteNameValidator = require('../validators/siteName.validator')
const validator = new SiteNameValidator()
const controller = new SiteNameController(Constants.Routes.SITE_NAME, validator)

module.exports = Route.register('GET, POST', controller, validator)
