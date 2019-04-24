
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
const Item = require('../persistence/entities/item.entity')
const { FACILITY_TYPES, PermitTypes } = require('../dynamics')
const { MCP } = FACILITY_TYPES
const { BESPOKE, STANDARD } = PermitTypes

const REQUIRES_DISPERSION_MODELLING = '1-10-2'
const DOES_NOT_REQUIRE_DISPERSION_MODELLING = '1-10-3'
const REQUIRES_ENERGY_EFFICIENCY_REPORT = 'MCP-EER'
const REQUIRES_BEST_AVAILABLE_TECHNIQUES_ASSESSMENT = 'MCP-BAT'
const REQUIRES_HABITATS_ASSESSMENT = '1-19-2'

module.exports = class MaintainApplicationLinesController extends BaseController {
  async doGet (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId, dataStore, isBespoke } = context
    const {
      wasteActivities,
      wasteAssessments,
      facilityType
    } = dataStore

    const [applicationLines, allActivities, allAssessments] = await Promise.all([
      ApplicationLine.listBy(context, { applicationId }),
      Item.listWasteActivities(context),
      Item.listWasteAssessments(context)
    ])

    const activities = wasteActivities ? wasteActivities.split(',').map((activity) => activity.trim()) : []
    const assessments = wasteAssessments ? wasteAssessments.split(',').map((assessment) => assessment.trim()) : []

    if (facilityType === MCP.id) {
      const {
        airDispersionModellingRequired,
        energyEfficiencyReportRequired,
        bestAvailableTechniquesAssessment,
        habitatAssessmentRequired
      } = dataStore
      if (airDispersionModellingRequired) {
        activities.push(REQUIRES_DISPERSION_MODELLING)
      } else {
        activities.push(DOES_NOT_REQUIRE_DISPERSION_MODELLING)
      }

      if (energyEfficiencyReportRequired) {
        assessments.push(REQUIRES_ENERGY_EFFICIENCY_REPORT)
      }

      if (bestAvailableTechniquesAssessment) {
        assessments.push(REQUIRES_BEST_AVAILABLE_TECHNIQUES_ASSESSMENT)
      }

      if (habitatAssessmentRequired) {
        assessments.push(REQUIRES_HABITATS_ASSESSMENT)
      }
    }

    // Obtain the activity and assessment data for those activities and assessments that have been selected.
    const filteredActivities = activities.map((activity) => allActivities.find(({ shortName }) => shortName === activity))
    const filteredAssessments = assessments.map((assessment) => allAssessments.find(({ shortName }) => shortName === assessment))

    // Combine the activities and assessments
    const items = [...filteredActivities, ...filteredAssessments].filter((item) => item !== undefined) // Only items that are defined

    // Delete application lines that are no longer required
    const itemIds = new Set(items.map(({ id }) => id))
    const toDelete = applicationLines.filter(({ itemId }) => itemId && !itemIds.has(itemId))
    await Promise.all(toDelete.map((applicationLine) => applicationLine.delete(context)))

    // Add missing application lines that are required
    const applicationLineItemIds = new Set(applicationLines.map(({ itemId }) => itemId))
    const toAdd = items.filter(({ id }) => !applicationLineItemIds.has(id))
    await Promise.all(toAdd.map((item) => {
      const applicationLine = new ApplicationLine({
        applicationId,
        itemId: item.id,
        permitType: isBespoke ? BESPOKE : STANDARD
      })
      return applicationLine.save(context)
    }))

    return this.redirect({ h })
  }
}
