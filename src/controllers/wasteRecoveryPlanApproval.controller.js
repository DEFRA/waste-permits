'use strict'

const { ALREADY_ASSESSED, NOT_ASSESSED, PLAN_HAS_CHANGED } = require('../dynamics').RecoveryPlanAssessmentStatus
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class WasteRecoveryPlanApprovalController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const { application } = await RecoveryService.createApplicationContext(h, { application: true })

    pageContext.formValues = request.payload || {}

    pageContext.alreadyAssessed = ALREADY_ASSESSED.TYPE
    pageContext.notAssessed = NOT_ASSESSED.TYPE
    pageContext.planHasChanged = PLAN_HAS_CHANGED.TYPE

    const status = application.recoveryPlanAssessmentStatus

    pageContext.isAlreadyAssessed = status === ALREADY_ASSESSED.TYPE
    pageContext.isPlanHasChanged = status === PLAN_HAS_CHANGED.TYPE
    pageContext.isNotAssessed = status === NOT_ASSESSED.TYPE

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h, { application: true })
    const { application } = context

    application.recoveryPlanAssessmentStatus = request.payload['selection']
    await application.save(context)

    return this.redirect({ h })
  }
}
