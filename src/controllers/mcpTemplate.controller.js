'use strict'

const BaseController = require('./base.controller')
const McpTemplate = require('../models/taskList/mcpTemplate.task')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const Constants = require('../constants')
const { BESPOKE: { id: BESPOKE }, STANDARD_RULES: { id: STANDARD_RULES } } = Constants.PermitTypes

module.exports = class McpTemplateController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    // Check the permit type (standard rules vs bespoke) and set a flag for the view
    // (I didn't pass the permitType value into the view because it would mean hardcoding the permitType values (set in constants.js) in the view)
    const { data: { permitType } } = await DataStore.get(context)
    switch (permitType) {
      case STANDARD_RULES:
        pageContext.standardPermitType = true
        break
      case BESPOKE:
        pageContext.bespokePermitType = true
        break
      default:
        throw new Error(`Unexpected permitType: ${permitType}`)
    }

    pageContext.isComplete = await McpTemplate.isComplete(context)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await McpTemplate.updateCompleteness(context)

    return this.redirect({ h })
  }
}
