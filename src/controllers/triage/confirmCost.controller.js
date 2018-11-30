'use strict'

const { DEFRA_COOKIE_KEY, COOKIE_KEY: { APPLICATION_ID } } = require('../../constants')

const { TRIAGE_ACTIVITY } = require('../../routes')

const BaseController = require('../base.controller')
const ApplicationCost = require('../../models/triage/applicationCost.model')
const Application = require('../../models/triage/application.model')

const ActiveDirectoryAuthService = require('../../services/activeDirectoryAuth.service')
const authService = new ActiveDirectoryAuthService()

module.exports = class ConfirmCostController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const entityContext = { authToken: await authService.getToken() }
    entityContext.applicationId = request.state[DEFRA_COOKIE_KEY] ? request.state[DEFRA_COOKIE_KEY][APPLICATION_ID] : undefined

    pageContext.calculatedCosts = await ApplicationCost.getApplicationCostForApplicationId(entityContext)

    // Determine triage path for page
    const permitHolderType = await Application.getPermitHolderTypeForApplicationId(entityContext)
    pageContext.activitiesLink = `${TRIAGE_ACTIVITY.path}/bespoke/${permitHolderType.id}/waste`

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h) {
    return this.redirect({ request, h, redirectPath: this.nextPath })
  }
}
