
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const WasteActivities = require('../models/wasteActivities.model')
const ItemEntity = require('../persistence/entities/item.entity')
const Routes = require('../routes')
const { WASTE_ASSESSMENT_APPLY_OFFLINE } = Routes

const FIRE_PREVENTION_PLAN = '1-19-3'
const ODOUR_MANAGEMENT_PLAN = '1-19-6'
const INCLUDES_FPP = ['1-16-6', '1-16-8', '1-16-9']
const INCLUDES_OMP = ['1-16-6', '1-16-8', '1-16-9', '1-16-18', '1-16-19']
const WASTE_ASSESSMENTS_LIST = ['1-19-5', FIRE_PREVENTION_PLAN, '1-19-2', '1-19-7', ODOUR_MANAGEMENT_PLAN, '1-19-4', '1-19-1']

module.exports = class WasteAssessmentController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants: { wasteAssessments } } = context

    const assessments = await ItemEntity.listWasteAssessments(context)

    const pageContext = this.createPageContext(h, errors)

    const selected = wasteAssessments.map(({ shortName }) => shortName)

    const { data: { alreadyConfirmedWasteAssessments, acceptsCombustibleWaste } } = await DataStore.get(context)
    if (!alreadyConfirmedWasteAssessments && !selected.length) {
      if (acceptsCombustibleWaste) {
        selected.push(FIRE_PREVENTION_PLAN)
      }
    }

    const wasteActivitiesModel = await WasteActivities.get(context)
    const wasteActivities = wasteActivitiesModel.wasteActivitiesValues.map(({ id }) => id)

    if (wasteActivities.some((element) => INCLUDES_FPP.includes(element))) {
      selected.push(FIRE_PREVENTION_PLAN)
    }

    if (wasteActivities.some((element) => INCLUDES_OMP.includes(element))) {
      selected.push(ODOUR_MANAGEMENT_PLAN)
    }

    pageContext.assessments = WASTE_ASSESSMENTS_LIST.map((id) => {
      const text = (assessments.find(({ shortName }) => id === shortName) || {}).itemName
      const isSelected = selected.includes(id)
      return { id, text, isSelected }
    })

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    const { assessment: assessments } = request.payload

    const wasteAssessments = BaseController.getMultivalueFormValueAsArray(assessments)
    await taskDeterminants.save({ wasteAssessments })

    await DataStore.save(context, { alreadyConfirmedWasteAssessments: true })

    const items = (await ItemEntity.listWasteAssessments(context)).filter((assessment) => taskDeterminants.wasteAssessments.includes(assessment))

    if (items.find(({ canApplyFor, canApplyOnline }) => !canApplyFor || !canApplyOnline)) {
      return this.redirect({ h, route: WASTE_ASSESSMENT_APPLY_OFFLINE })
    }
    return this.redirect({ h })
  }
}
