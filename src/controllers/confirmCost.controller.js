'use strict'
const { WASTE_ACTIVITY_CONTINUE } = require('../routes.js')
const { MCP } = require('../dynamics').FACILITY_TYPES

const BaseController = require('./base.controller')
const ApplicationCost = require('../models/applicationCost.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class ConfirmCostController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const { taskDeterminants: { facilityType } } = context

    pageContext.calculatedCosts = await ApplicationCost.getApplicationCostForApplicationId(context)

    if (facilityType !== MCP) {
      pageContext.wasteActivitiesLink = WASTE_ACTIVITY_CONTINUE.path
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    return this.redirect({ h })
  }
}
