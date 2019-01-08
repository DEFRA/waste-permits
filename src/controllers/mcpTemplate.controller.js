'use strict'

const BaseController = require('./base.controller')
const McpTemplate = require('../models/taskList/mcpTemplate.task')
const RecoveryService = require('../services/recovery.service')

module.exports = class McpTemplateController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    pageContext.isComplete = await McpTemplate.isComplete(context)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await McpTemplate.updateCompleteness(context)

    return this.redirect({ h })
  }
}
