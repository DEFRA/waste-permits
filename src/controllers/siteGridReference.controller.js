'use strict'

const Routes = require('../routes')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.task')
const RecoveryService = require('../services/recovery.service')
const Constants = require('../constants')

module.exports = class SiteGridReferenceController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.pageGridRefText = 'site\'s main emissions point'
    pageContext.pageHeading = `What is the grid reference for the site's main emissions point?`
    pageContext.pageTitle = Constants.buildPageTitle(pageContext.pageHeading)

    if (request.payload) {
      // If we have Site details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-grid-reference': await SiteNameAndLocation.getGridReference(request)
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)

    await SiteNameAndLocation.saveGridReference(request, request.payload['site-grid-reference'])

    return this.redirect({ h, route: Routes.POSTCODE_SITE })
  }
}
