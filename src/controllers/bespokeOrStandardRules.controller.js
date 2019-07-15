'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = require('../constants').PermitTypes

module.exports = class BespokeOrStandardRulesController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    pageContext.formValues = request.payload || request.query

    if (pageContext.formValues['permit-type']) {
      pageContext.selectedBespokePermitType = pageContext.formValues['permit-type'] === BESPOKE
      pageContext.selectedStandardRulesPermitType = pageContext.formValues['permit-type'] === STANDARD_RULES
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    // Save the permit type in the Data store
    const permitType = request.payload['permit-type']

    if (![BESPOKE, STANDARD_RULES].includes(permitType)) {
      throw new Error(`Unexpected permitType: ${permitType}`)
    } else {
      await taskDeterminants.save({ permitType })

      if (permitType === BESPOKE) {
        // Enter the triage steps for bespoke
        return this.redirect({ h, route: this.route.bespokeRoute })
      } else {
        return this.redirect({ h })
      }
    }
  }
}
