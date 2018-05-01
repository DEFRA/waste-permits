'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')
const SiteNameAndLocation = require('../models/taskList/siteNameAndLocation.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class SiteNameController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      // If we have Location name in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      pageContext.formValues = {
        'site-name': await SiteNameAndLocation.getSiteName(request, authToken, applicationId, applicationLineId)
      }
    }

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

      await SiteNameAndLocation.saveSiteName(request, request.payload['site-name'], authToken, applicationId, applicationLineId)

      return this.redirect({request, h, redirectPath: Constants.Routes.SITE_GRID_REFERENCE.path})
    }
  }
}
