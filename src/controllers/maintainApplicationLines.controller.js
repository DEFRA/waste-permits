
'use strict'

const { APPLICATION_LINE_ID } = require('../constants').COOKIE_KEY
const BaseController = require('./base.controller')
const CookieService = require('../services/cookie.service')
const RecoveryService = require('../services/recovery.service')
const WasteActivities = require('../models/wasteActivities.model')
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
      wasteAssessments
    } = taskDeterminants

    const wasteActivities = await WasteActivities.get(context)

    const applicationLines = await ApplicationLine.listBy(context, { applicationId })

    if (facilityType === MCP) {
      const {
        airDispersionModellingRequired,
        energyEfficiencyReportRequired,
        bestAvailableTechniquesAssessment,
        habitatAssessmentRequired
      } = taskDeterminants
      if (airDispersionModellingRequired) {
        wasteActivities.addWasteActivity(REQUIRES_DISPERSION_MODELLING)
      } else {
        wasteActivities.addWasteActivity(DOES_NOT_REQUIRE_DISPERSION_MODELLING)
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

    // Delete all the existing application lines
    for (let index = 0; index < applicationLines.length; index++) {
      const applicationLine = applicationLines[index]
      await applicationLine.delete(context)
    }

    // Add the activities
    const wasteActivitiesValues = wasteActivities.wasteActivitiesValues
    for (const wasteActivity of wasteActivitiesValues) {
      if (wasteActivity.item) {
        const applicationLine = new ApplicationLine({
          applicationId,
          itemId: wasteActivity.item.id,
          permitType: isBespoke ? BESPOKE : STANDARD,
          lineName: wasteActivity.referenceName
        })
        await applicationLine.save(context)
      }
    }

    // Add the assessments
    for (let index = 0; index < wasteAssessments.length; index++) {
      const item = wasteAssessments[index]
      if (item) {
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
