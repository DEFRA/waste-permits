'use strict'

const BaseController = require('./base.controller')
const McpTemplate = require('../models/taskList/mcpTemplate.task')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const Constants = require('../constants')
const { BESPOKE, STANDARD_RULES } = Constants.PermitTypes
const { MCP_TYPES: { STATIONARY_MCP, STATIONARY_SG, STATIONARY_MCP_AND_SG, MOBILE_SG, MOBILE_SG_AND_MCP } } = require('../models/triage/triageLists')
let templatesStandardRules = [
  { id: 'mcp-template-xls-link', name: 'Plant or generator list template (Excel XLS)', file: 'mcp-plant-generator-list-template-v0-1.xls' },
  { id: 'mcp-template-ods-link', name: 'Plant or generator list template (Open Document ODS)', file: 'mcp-plant-generator-list-template-v0-1.ods' }
]
let templatesBespokeAppendix1 = [
  { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 1 (Excel XLS)', file: 'plant-generator-list-template-app1-v1-0.xls' },
  { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 1 (Open Document ODS)', file: 'plant-generator-list-template-app1-v1-0.ods' }
]
let templatesBespokeAppendix2 = [
  { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 2 (Excel XLS)', file: 'plant-generator-list-template-app1-v2-0.xls' },
  { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 2 (Open Document ODS)', file: 'plant-generator-list-template-app1-v2-0.ods' }
]

module.exports = class McpTemplateController extends BaseController {
  async getTemplates (context) {
    // There are different templates, so show the template downloads relevant to this application
    const { data: { permitType, mcpType } } = await DataStore.get(context)
    switch (permitType) {
      case STANDARD_RULES.id:
        return templatesStandardRules
      case BESPOKE.id:
        switch (mcpType) {
          case STATIONARY_MCP.id:
          case STATIONARY_MCP_AND_SG.id:
          case MOBILE_SG_AND_MCP.id:
            return templatesBespokeAppendix1
          case STATIONARY_SG.id:
          case MOBILE_SG.id:
            return templatesBespokeAppendix2
          default:
            throw new Error(`Unexpected mcpType: ${mcpType}`)
        }
      default:
        throw new Error(`Unexpected permitType: ${permitType}`)
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
