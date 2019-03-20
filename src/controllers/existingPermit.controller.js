'use strict'

const BaseController = require('./base.controller')
const DataStore = require('../models/dataStore.model')
const RecoveryService = require('../services/recovery.service')
const { BESPOKE: { id: BESPOKE } } = require('../../src/constants').PermitTypes
const { MCP_TYPES: { MOBILE_SG, MOBILE_SG_AND_MCP } } = require('../models/triage/triageLists')

module.exports = class ExistingPermitController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)
    let data
    if (dataStore) {
      data = dataStore.data
    }
    // if the mcp type is mobile:
    //   no need to worry about existing application
    //   so jump to air dispersion steps
    if (
      data &&
      data.permitType === BESPOKE &&
      (data.mcpType === MOBILE_SG.id || data.mcpType === MOBILE_SG_AND_MCP.id)
    ) {
      return this.redirect({ h, route: 'MCP_AIR_DISPERSION_MODELLING' })
    }
    const pageContext = this.createPageContext(h, errors)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const { 'existing-permit': existingPermit } = request.payload

    if (existingPermit === 'yes') {
      return this.redirect({ h, route: 'MCP_HAS_EXISTING_PERMIT' })
    }

    const context = await RecoveryService.createApplicationContext(h)
    const dataStore = await DataStore.get(context)
    if (dataStore.data.permitType === BESPOKE) {
      return this.redirect({ h, route: 'MCP_UNDER_500_HOURS' })
    } else {
      return this.redirect({ h, route: 'TASK_LIST' })
    }
  }
}
