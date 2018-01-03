'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const SiteGridReferenceController = require('../controllers/siteGridReference.controller')
const SiteGridReferenceValidator = require('../validators/siteGridReference.validator')
const validator = new SiteGridReferenceValidator()
const controller = new SiteGridReferenceController(Constants.Routes.SITE_GRID_REFERENCE)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
