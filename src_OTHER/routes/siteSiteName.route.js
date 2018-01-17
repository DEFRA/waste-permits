'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const SiteSiteNameController = require('../controllers/siteSiteName.controller')
const SiteSiteNameValidator = require('../validators/siteSiteName.validator')
const validator = new SiteSiteNameValidator()
const controller = new SiteSiteNameController(Constants.Routes.SITE_SITE_NAME)

module.exports = Route.register('GET, POST', controller, validator)
