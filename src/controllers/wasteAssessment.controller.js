
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const ItemEntity = require('../persistence/entities/item.entity')
const Routes = require('../routes')
const { WASTE_ASSESSMENT_APPLY_OFFLINE } = Routes

module.exports = class WasteAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants: { wasteAssessments } } = context

    const assessments = await ItemEntity.listWasteAssessments(context)

    const pageContext = this.createPageContext(h, errors)

    const selected = wasteAssessments.map(({ shortName }) => shortName)
    pageContext.assessments = assessments
      .filter(({ canApplyFor }) => canApplyFor)
      .map(({ shortName, itemName }) => ({ id: shortName, text: itemName, isSelected: selected.includes(shortName) }))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    const { assessment: assessments } = request.payload

    const wasteAssessments = assessments.split(',')
    await taskDeterminants.save({ wasteAssessments })

    const items = (await ItemEntity.listWasteAssessments(context)).filter((assessment) => taskDeterminants.wasteAssessments.includes(assessment))

    if (items.find(({ canApplyFor, canApplyOnline }) => !canApplyFor || !canApplyOnline)) {
      return this.redirect({ h, route: WASTE_ASSESSMENT_APPLY_OFFLINE })
    }
    return this.redirect({ h })
  }
}
