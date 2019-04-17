
'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const McpType = require('../models/mcpType.model')
const Dynamics = require('../dynamics')
const { CREATE_APPLICATION_LINES, MCP_EXISTING_PERMIT, MCP_REQUIRES_ENERGY_REPORT } = require('../routes')
const { MCP_TYPES } = Dynamics
const { MOBILE_SG, MOBILE_SG_AND_MCP, STATIONARY_MCP, STATIONARY_MCP_AND_SG, STATIONARY_SG } = MCP_TYPES

const mcpTypes = Object.keys(MCP_TYPES).map((mcpType) => MCP_TYPES[mcpType])

module.exports = class McpTypeController extends BaseController {
  async doGet (request, h, errors) {
    const { mcpType = {} } = await RecoveryService.createApplicationContext(h)
    const { id: mcpTypeId } = mcpType
    const pageContext = this.createPageContext(h, errors)

    pageContext.mcpTypes = mcpTypes.map((mcpType) => Object.assign(mcpType, { selected: mcpType.id === mcpTypeId }))

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const { 'mcp-type': mcpTypeId } = request.payload

    const mcpType = await McpType.get(context) || new McpType()
    mcpType.id = mcpTypeId
    await mcpType.save(context)

    switch (mcpType.id) {
      case STATIONARY_MCP.id:
      case STATIONARY_SG.id:
      case STATIONARY_MCP_AND_SG.id:
        return this.redirect({ h, route: MCP_EXISTING_PERMIT })
      case MOBILE_SG.id:
        return this.redirect({ h, route: CREATE_APPLICATION_LINES })
      case MOBILE_SG_AND_MCP.id:
        return this.redirect({ h, route: MCP_REQUIRES_ENERGY_REPORT })
    }
  }
}
