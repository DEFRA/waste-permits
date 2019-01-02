'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.task')
const RecoveryService = require('../services/recovery.service')

module.exports = class SiteNameController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      // If we have Location name in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-name': await SiteNameAndLocation.getSiteName(request)
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)

    await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'])

    return this.redirect({ h, route: Routes.SITE_GRID_REFERENCE })
  }
}
