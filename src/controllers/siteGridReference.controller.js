'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.task')
const RecoveryService = require('../services/recovery.service')

module.exports = class SiteGridReferenceController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      // If we have Site details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-grid-reference': await SiteNameAndLocation.getGridReference(request)
      }
    }
    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      await RecoveryService.createApplicationContext(h)

      await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'])

      return this.redirect({ request, h, redirectPath: Routes.POSTCODE_SITE.path })
    }
  }
}
