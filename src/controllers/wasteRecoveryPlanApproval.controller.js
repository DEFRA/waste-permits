'use strict'

const {ALREADY_ASSESSED, NOT_ASSESSED, PLAN_HAS_CHANGED} = require('../dynamics').RecoveryPlanAssessmentStatus
const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')

module.exports = class WasteRecoveryPlanApprovalController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {application} = await RecoveryService.createApplicationContext(h, {application: true})

    pageContext.formValues = request.payload || {}

    pageContext.alreadyAssessed = ALREADY_ASSESSED
    pageContext.notAssessed = NOT_ASSESSED
    pageContext.planHasChanged = PLAN_HAS_CHANGED

    const status = application.recoveryPlanAssessmentStatus

    pageContext.isAlreadyAssessed = status === ALREADY_ASSESSED
    pageContext.isPlanHasChanged = status === PLAN_HAS_CHANGED
    pageContext.isNotAssessed = status === NOT_ASSESSED

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h, {application: true})
      const {application} = context

      application.recoveryPlanAssessmentStatus = request.payload['selection']
      await application.save(context)

      return this.redirect({request, h, redirectPath: this.nextPath})
    }
  }
}