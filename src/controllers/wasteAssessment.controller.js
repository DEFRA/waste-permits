
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const WasteAssessments = require('../models/wasteAssessments.model')
const ItemEntity = require('../persistence/entities/item.entity')
const Routes = require('../routes')
const { WASTE_ASSESSMENT_APPLY_OFFLINE } = Routes

module.exports = class WasteAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { wasteAssessments } = context

    const assessments = await ItemEntity.listWasteAssessments(context)

    const pageContext = this.createPageContext(h, errors)

    pageContext.assessments = assessments
      .filter(({ canApplyFor }) => canApplyFor)
      .map(({ shortName, itemName }) => ({ id: shortName, text: itemName, isSelected: wasteAssessments.includes(shortName) }))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { wasteAssessments = new WasteAssessments() } = context

    const { assessment: assessments } = request.payload

    wasteAssessments.assessments = assessments
    await wasteAssessments.save(context)

    const items = (await ItemEntity.listWasteAssessments(context)).filter(({ shortName }) => wasteAssessments.includes(shortName))

    if (items.find(({ canApplyFor, canApplyOnline }) => !canApplyFor || !canApplyOnline)) {
      return this.redirect({ h, route: WASTE_ASSESSMENT_APPLY_OFFLINE })
    }
    return this.redirect({ h })
  }
}
