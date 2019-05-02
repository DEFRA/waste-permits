'use strict'

const BaseController = require('./base.controller')
const { MAINTAIN_APPLICATION_LINES } = require('../routes')
const RecoveryService = require('../services/recovery.service')
const OperatingUnder500HoursModel = require('../models/operatingUnder500Hours.model')

const { STATIONARY_SG, MOBILE_SG, MOBILE_MCP } = require('../dynamics').MCP_TYPES
const YES = 'yes'

module.exports = class OperatingUnder500HoursController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)

    // Do not show the page for some MCP types
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context
    switch (taskDeterminants.mcpType) {
      case STATIONARY_SG:
      case MOBILE_SG:
      case MOBILE_MCP:
        return this.redirect({ h })
    }

    const under500Hours = await OperatingUnder500HoursModel.get(context)

    // we set a separate no variable as Handlebars only allow us to check whether a variable equates to true/false
    // which causes problems as we can't differentiate between 'operating-under-500-hours is false' (ie. No was selected)
    // and 'operating-under-500-hours is undefined' (ie. nothing has been selected yet)
    pageContext.formValues = {
      'operating-under-500-hours': under500Hours.operatingUnder500Hours,
      'operating-under-500-hours-no': under500Hours.operatingUnder500Hours === false
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants } = context

    const operatingUnder500Hours = request.payload['operating-under-500-hours'] === YES

    const under500Hours = {
      operatingUnder500Hours: operatingUnder500Hours
    }

    const operatingUnder500HoursModel = new OperatingUnder500HoursModel(under500Hours)
    await operatingUnder500HoursModel.save(context)

    // If they are operating for under 500 hours then these are set to false, otherwise they're set true
    await taskDeterminants.save({
      airDispersionModellingRequired: !operatingUnder500Hours,
      energyEfficiencyReportRequired: !operatingUnder500Hours,
      bestAvailableTechniquesAssessment: !operatingUnder500Hours,
      habitatAssessmentRequired: !operatingUnder500Hours,
      screeningToolRequired: !operatingUnder500Hours
    })

    if (operatingUnder500Hours) {
      return this.redirect({ h, route: MAINTAIN_APPLICATION_LINES })
    } else {
      return this.redirect({ h })
    }
  }
}
