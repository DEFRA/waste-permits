'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MCP_AIR_DISPERSION_MODELLING, MCP_HAS_EXISTING_PERMIT, MCP_UNDER_500_HOURS, TASK_LIST } = require('../routes')
const { MOBILE_SG, MOBILE_MCP } = require('../dynamics').MCP_TYPES

module.exports = class ExistingPermitController extends BaseController {
  async doGet (request, h, errors) {
    const { taskDeterminants: { mcpType }, isBespoke } = await RecoveryService.createApplicationContext(h)

    if (isBespoke) {
      switch (mcpType) {
        case MOBILE_SG:
        case MOBILE_MCP:
          return this.redirect({ h, route: MCP_AIR_DISPERSION_MODELLING })
      }
    }

    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { 'existing-permit': existingPermit } = request.payload

    if (existingPermit === 'yes') {
      return this.redirect({ h, route: MCP_HAS_EXISTING_PERMIT })
    }

    const { isBespoke } = await RecoveryService.createApplicationContext(h)
    if (isBespoke) {
      return this.redirect({ h, route: MCP_UNDER_500_HOURS })
    } else {
      return this.redirect({ h, route: TASK_LIST })
    }
  }
}
