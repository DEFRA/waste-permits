
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const Dynamics = require('../dynamics')
const { MAINTAIN_APPLICATION_LINES, MCP_EXISTING_PERMIT, MCP_REQUIRES_ENERGY_REPORT } = require('../routes')
const { MCP_TYPES } = Dynamics
const { MOBILE_SG, MOBILE_MCP, STATIONARY_MCP, STATIONARY_MCP_AND_SG, STATIONARY_SG } = MCP_TYPES

module.exports = class McpTypeController extends BaseController {
  async doGet (request, h, errors) {
    const { taskDeterminants: { mcpType } } = await RecoveryService.createApplicationContext(h)
    const pageContext = this.createPageContext(h, errors)

    pageContext.mcpTypes = Object.values(MCP_TYPES).map((type) => Object.assign({ selected: type === mcpType }, type))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { taskDeterminants } = await RecoveryService.createApplicationContext(h)
    const { 'mcp-type': mcpType } = request.payload

    let aqmaRequired
    let siteNameRequired
    let businessActivityRequired

    // set determinants based on mcpType
    switch (mcpType) {
      case STATIONARY_MCP.id:
        aqmaRequired = true
        siteNameRequired = true
        businessActivityRequired = true
        break
      case STATIONARY_SG.id:
        aqmaRequired = true
        siteNameRequired = true
        break
      case STATIONARY_MCP_AND_SG.id:
        aqmaRequired = true
        siteNameRequired = true
        businessActivityRequired = true
        break
      case MOBILE_SG.id:
        break
      case MOBILE_MCP.id:
        businessActivityRequired = true
        break
    }

    await taskDeterminants.save({
      mcpType,
      aqmaRequired,
      siteNameRequired,
      businessActivityRequired
    })

    switch (mcpType) {
      case STATIONARY_MCP.id:
      case STATIONARY_SG.id:
      case STATIONARY_MCP_AND_SG.id:
        return this.redirect({ h, route: MCP_EXISTING_PERMIT })
      case MOBILE_SG.id:
        return this.redirect({ h, route: MAINTAIN_APPLICATION_LINES })
      case MOBILE_MCP.id:
        return this.redirect({ h, route: MCP_REQUIRES_ENERGY_REPORT })
    }
  }
}
