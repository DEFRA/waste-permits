'use strict'

const BaseController = require('./base.controller')
const DataStore = require('../models/dataStore.model')
const RecoveryService = require('../services/recovery.service')
const { BESPOKE: { id: BESPOKE } } = require('../../src/constants').PermitTypes

module.exports = class ExistingPermitController extends BaseController {
  async doGet (request, h, errors) {
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
      return this.redirect({ h, route: 'MCP_AIR_DISPERSION_MODELLING' })
    } else {
      return this.redirect({ h, route: 'TASK_LIST' })
    }
  }
}
