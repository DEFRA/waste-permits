
'use strict'

const { APPLICATION_LINE_ID } = require('../constants').COOKIE_KEY
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const ApplicationLine = require('../persistence/entities/applicationLine.entity')
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
    const { applicationId, isBespoke, taskDeterminants } = context
    const {
      facilityType,
      wasteActivities,
      wasteAssessments
    } = taskDeterminants

    const applicationLines = await ApplicationLine.listBy(context, { applicationId })

    if (facilityType === MCP) {
      const {
        airDispersionModellingRequired,
        energyEfficiencyReportRequired,
        bestAvailableTechniquesAssessment,
        habitatAssessmentRequired
      } = taskDeterminants
      if (airDispersionModellingRequired) {
        wasteActivities.push(REQUIRES_DISPERSION_MODELLING)
      } else {
        wasteActivities.push(DOES_NOT_REQUIRE_DISPERSION_MODELLING)
      }

      if (energyEfficiencyReportRequired) {
        wasteAssessments.push(REQUIRES_ENERGY_EFFICIENCY_REPORT)
      }

      if (bestAvailableTechniquesAssessment) {
        wasteAssessments.push(REQUIRES_BEST_AVAILABLE_TECHNIQUES_ASSESSMENT)
      }

      if (habitatAssessmentRequired) {
        wasteAssessments.push(REQUIRES_HABITATS_ASSESSMENT)
      }
    }

    // Combine the activities and assessments
    const items = [...wasteActivities, ...wasteAssessments].filter((item) => item !== undefined) // Only items that are defined

    // Delete application lines that are no longer required
    const itemIds = new Set(items.map(({ id }) => id))
    for (let index = 0; index < applicationLines.length; index++) {
      const applicationLine = applicationLines[index]
      if (applicationLine.itemId && !itemIds.has(applicationLine.itemId)) {
        await applicationLine.delete(context)
      }
    }

    // Add missing application lines that are required
    const applicationLineItemIds = new Set(applicationLines.map(({ itemId }) => itemId))
    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      if (!applicationLineItemIds.has(item.id)) {
        const applicationLine = new ApplicationLine({
          applicationId,
          itemId: item.id,
          permitType: isBespoke ? BESPOKE : STANDARD
        })
        await applicationLine.save(context)
      }
    }

    // Set the application ID in the cookie if not already set
    if (!context.APPLICATION_LINE_ID) {
      const applicationLine = await ApplicationLine.getByApplicationId(context)
      CookieService.set(request, APPLICATION_LINE_ID, applicationLine.id)
    }

    return this.redirect({ h })
  }
}
