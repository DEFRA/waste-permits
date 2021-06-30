'use strict'

const BaseController = require('./base.controller')
const McpTemplate = require('../models/taskList/mcpTemplate.task')
const RecoveryService = require('../services/recovery.service')
const { BESPOKE, STANDARD_RULES } = require('../constants').PermitTypes
const { STATIONARY_MCP, STATIONARY_SG, STATIONARY_MCP_AND_SG, MOBILE_SG, MOBILE_MCP } = require('../dynamics').MCP_TYPES
const templatesStandardRules = [
  { id: 'mcp-template-xls-link', name: 'Plant or generator list template (Excel XLS)', file: 'mcp-plant-generator-list-template-v0-1.xls' },
  { id: 'mcp-template-ods-link', name: 'Plant or generator list template (Open Document ODS)', file: 'mcp-plant-generator-list-template-v0-1.ods' }
]
const templatesBespokeAppendix1 = [
  { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 1 (Excel XLS)', file: 'plant-generator-list-template-app1-v1-0.xls' },
  { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 1 (Open Document ODS)', file: 'plant-generator-list-template-app1-v1-0.ods' }
]
const templatesBespokeAppendix2 = [
  { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 2 (Excel XLS)', file: 'plant-generator-list-template-app2-v1-0.xls' },
  { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 2 (Open Document ODS)', file: 'plant-generator-list-template-app2-v1-0.ods' }
]

module.exports = class McpTemplateController extends BaseController {
  async getTemplates ({ taskDeterminants: { mcpType, permitType } }) {
    // There are different templates, so show the template downloads relevant to this application
    switch (permitType) {
      case STANDARD_RULES:
        return templatesStandardRules
      case BESPOKE:
        switch (mcpType) {
          case STATIONARY_MCP:
          case STATIONARY_MCP_AND_SG:
          case MOBILE_MCP:
            return templatesBespokeAppendix1
          case STATIONARY_SG:
          case MOBILE_SG:
            return templatesBespokeAppendix2
          default:
            throw new Error(`Unexpected mcpType: ${mcpType.id}`)
        }
      default:
        throw new Error(`Unexpected permitType: ${permitType.id}`)
    }
  }

  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)
    pageContext.templates = await this.getTemplates(context)
    pageContext.isComplete = await McpTemplate.isComplete(context)

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    await McpTemplate.updateCompleteness(context)

    return this.redirect({ h })
  }
}
