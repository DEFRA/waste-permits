'use strict'

const BaseController = require('./base.controller')
const McpTemplate = require('../models/taskList/mcpTemplate.task')
const RecoveryService = require('../services/recovery.service')
const DataStore = require('../models/dataStore.model')
const Constants = require('../constants')
const { BESPOKE, STANDARD_RULES } = Constants.PermitTypes
const { MCP_TYPES: { STATIONARY_MCP, STATIONARY_SG, STATIONARY_MCP_AND_SG, MOBILE_SG, MOBILE_SG_AND_MCP } } = require('../models/triage/triageLists')

module.exports = class McpTemplateController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(h, errors)
    const context = await RecoveryService.createApplicationContext(h)

    // There are different templates, so show the template downloads relevant to this application
    const { data: { permitType, mcpType } } = await DataStore.get(context)
    if (permitType === STANDARD_RULES.id) {
      pageContext.templates = [
        { id: 'mcp-template-xls-link', name: 'Plant or generator list template (Excel XLS)', file: 'mcp-plant-generator-list-template-v0-1.xls' },
        { id: 'mcp-template-ods-link', name: 'Plant or generator list template (Open Document ODS)', file: 'mcp-plant-generator-list-template-v0-1.ods' }
      ]
    } else if (permitType === BESPOKE.id) {
      // TODO: Set the correct links and put the linked files in place, ready for download
      if (mcpType === STATIONARY_MCP.id ||
          mcpType === STATIONARY_MCP_AND_SG.id ||
          mcpType === MOBILE_SG_AND_MCP.id) {
        pageContext.templates = [
          { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 1 (Excel XLS)', file: 'todo' },
          { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 1 (Open Document ODS)', file: 'todo' }
        ]
      } else if (mcpType === STATIONARY_SG.id ||
                 mcpType === MOBILE_SG.id) {
        pageContext.templates = [
          { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 2 (Excel XLS)', file: 'todo' },
          { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 2 (Open Document ODS)', file: 'todo' }
        ]
      } else {
        throw new Error(`Unexpected mcpType: ${mcpType}`)
      }
    } else {
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
