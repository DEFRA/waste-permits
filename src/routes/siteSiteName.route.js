'use strict'

const Constants = require('../constants')
const BaseRoute = require('./baseRoute')
const SiteSiteNameController = require('../controllers/siteSiteName.controller')
const SiteSiteNameValidator = require('../validators/siteSiteName.validator')
const validator = new SiteSiteNameValidator()
const controller = new SiteSiteNameController(Constants.Routes.SITE_SITE_NAME)

const routes = [{
  method: 'GET'
}, {
  method: 'POST'
}]

const route = new BaseRoute(routes, controller, validator)
module.exports = route.register()
