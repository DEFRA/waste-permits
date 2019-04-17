'use strict'
const { WASTE_ACTIVITY } = require('../routes.js')

const BaseController = require('./base.controller')
const ApplicationCost = require('../models/applicationCost.model')
const RecoveryService = require('../services/recovery.service')

module.exports = class ConfirmCostController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    pageContext.calculatedCosts = await ApplicationCost.getApplicationCostForApplicationId(context)

    if (!context.mcpType) {
      pageContext.wasteActivitiesLink = WASTE_ACTIVITY.path
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    return this.redirect({ h })
  }
}
