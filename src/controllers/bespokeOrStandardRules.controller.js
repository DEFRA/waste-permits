'use strict'

const { TRIAGE_PERMIT_TYPE } = require('../routes')
const BaseController = require('./base.controller')
const featureConfig = require('../config/featureConfig')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = require('../constants').PermitTypes

module.exports = class BespokeOrStandardRulesController extends BaseController {
  async doGet (request, h, errors) {
    // Todo: Remove this redirect when Bespoke is live
    if (!featureConfig.hasBespokeFeature) {
      return this.redirect({ request, h, redirectPath: this.nextPath })
    }

    const pageContext = this.createPageContext(request, errors)

    pageContext.formValues = request.payload || request.query

    if (pageContext.formValues['permit-type']) {
      pageContext.selectedBespokePermitType = pageContext.formValues['permit-type'] === BESPOKE
      pageContext.selectedStandardRulesPermitType = pageContext.formValues['permit-type'] === STANDARD_RULES
    }

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    }

    const context = await RecoveryService.createApplicationContext(h)
    // Save the permit type in the Data store
    const permitType = request.payload['permit-type']

    if (![BESPOKE, STANDARD_RULES].includes(permitType)) {
      throw new Error(`Unexpected permitType: ${permitType}`)
    } else {
      await DataStore.save(context, { permitType })

      if (permitType === BESPOKE) {
        // Enter the triage steps for bespoke
        return this.redirect({ request, h, redirectPath: `${TRIAGE_PERMIT_TYPE.path}/bespoke` })
      } else {
        return this.redirect({ request, h, redirectPath: this.nextPath })
      }
    }
  }
}
