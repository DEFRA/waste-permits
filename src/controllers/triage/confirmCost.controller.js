'use strict'

const { DEFRA_COOKIE_KEY, COOKIE_KEY: { APPLICATION_ID } } = require('../../constants')

const { TRIAGE_WASTE_ACTIVITY } = require('../../routes.js')

const BaseController = require('../base.controller')
const ApplicationCost = require('../../models/triage/applicationCost.model')

const ActiveDirectoryAuthService = require('../../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class ConfirmCostController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const entityContext = { authToken: await authService.getToken() }
    entityContext.applicationId = request.state[DEFRA_COOKIE_KEY] ? request.state[DEFRA_COOKIE_KEY][APPLICATION_ID] : undefined

    pageContext.calculatedCosts = await ApplicationCost.getApplicationCostForApplicationId(entityContext)

    pageContext.wasteActivitiesLink = `${TRIAGE_WASTE_ACTIVITY.path}/bespoke`

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    return this.redirect({ h })
  }
}
