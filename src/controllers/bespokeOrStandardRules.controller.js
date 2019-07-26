'use strict'

const BaseController = require('./base.controller')
const featureConfig = require('../config/featureConfig')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')

const {
  COOKIE_KEY: { APPLICATION_LINE_ID },
  PermitTypes: { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } }
} = require('../constants')

module.exports = class BespokeOrStandardRulesController extends BaseController {
  async doGet (request, h, errors) {
    // Todo: Remove this redirect when Bespoke is live
    if (!featureConfig.hasBespokeFeature && !featureConfig.hasMcpBespokeFeature) {
      return this.redirect({ h })
    }

    const pageContext = this.createPageContext(h, errors)

    pageContext.formValues = request.payload || request.query

    if (pageContext.formValues['permit-type']) {
      pageContext.selectedBespokePermitType = pageContext.formValues['permit-type'] === BESPOKE
      pageContext.selectedStandardRulesPermitType = pageContext.formValues['permit-type'] === STANDARD_RULES
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId, taskDeterminants } = context

    // Save the permit type in the Data store
    const permitType = request.payload['permit-type']

    if (![BESPOKE, STANDARD_RULES].includes(permitType)) {
      throw new Error(`Unexpected permitType: ${permitType}`)
    } else {
      await taskDeterminants.save({ permitType, facilityType: undefined })
    }

    // delete all existing application lines
    const applicationLines = await ApplicationLine.listBy(context, { applicationId })
    for await (const applicationLine of applicationLines) {
      await applicationLine.delete(context)
    }
    CookieService.remove(request, APPLICATION_LINE_ID)

    if (permitType === BESPOKE) {
      // Enter the triage steps for bespoke
      return this.redirect({ h, route: this.route.bespokeRoute })
    } else {
      return this.redirect({ h })
    }
  }
}
