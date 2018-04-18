'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const SiteGridReferenceController = require('../controllers/siteGridReference.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const validator = new SiteGridReferenceValidator()
const controller = new SiteGridReferenceController({route: Constants.Routes.SITE_GRID_REFERENCE, validator})

module.exports = Route.register('GET, POST', controller, validator)
