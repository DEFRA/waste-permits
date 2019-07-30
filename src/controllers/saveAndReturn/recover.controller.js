'use strict'

const { RECOVERY_FAILED, TASK_LIST, BACS_PROOF, BESPOKE_OR_STANDARD_RULES } = require('../../routes')
const BaseController = require('../base.controller')
const LoggingService = require('../../services/logging.service')
const RecoveryService = require('../../services/recovery.service')
const ApplicationLine = require('../../persistence/entities/applicationLine.entity')
const Payment = require('../../persistence/entities/payment.entity')

module.exports = class RecoverController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    if (!context) {
      return this.redirect({ h, route: RECOVERY_FAILED })
    }
    const { application, isBespoke, isMcp, isStandardRule, slug } = context
    const applicationNumber = application.applicationNumber
    const pageContext = this.createPageContext(h)
    pageContext.formAction = request.path

    if (isStandardRule) {
      const { standardRule } = context
      const { id: standardRuleId, standardRuleTypeId, code, permitName } = standardRule || {}
      Object.assign(pageContext, { slug, applicationNumber, standardRuleId, standardRuleTypeId, code, permitName, isStandardRule })
    } else if (isBespoke && isMcp) {
      const { airDispersionModellingRequired, mcpType } = context.taskDeterminants
      const permitName = airDispersionModellingRequired
        ? 'Medium combustion plant site - requires dispersion modelling'
        : 'Medium combustion plant site - does not require dispersion modelling'
      Object.assign(pageContext, { slug, applicationNumber, permitName, permitType: mcpType.text, isBespoke })
    } else {
      // Permit type has not been determined so log an error and continue
      const errorMessage = `Invalid permit type for application ${applicationNumber}`
      LoggingService.logError(errorMessage, request)
      Object.assign(pageContext, { slug, applicationNumber })
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId, cookie } = context

    // If there is an outstanding BACS payment then redirect to that rather than the task list
    const bacsPayment = await Payment.getBacsPayment(context)
    if (bacsPayment) {
      return this.redirect({ h, route: BACS_PROOF, cookie })
    }

    // If no application lines exist then redirect to the start of the pre-tasklist process
    const applicationLines = await ApplicationLine.listBy(context, { applicationId })
    if (!applicationLines.length) {
      return this.redirect({ h, route: BESPOKE_OR_STANDARD_RULES, cookie })
    }

    // Now redirect to the tasklist
    return this.redirect({ h, route: TASK_LIST, cookie })
  }
}
