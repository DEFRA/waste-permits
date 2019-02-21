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

    // Show the templates relevant for this application
    const { data: { permitType } } = await DataStore.get(context)
    // TODO: mcpType temporarily hard-coded.  Get the mcp type chosen by the user (it's not yet in Dynamics, but Kas is looking into storing it)
    // TODO: Not sure if it can be here for standard rules.  I assume it would just be a undefined for a standard rule rather than breaking it
    const mcpType = 'stationary-mcp-sg'
    const { application } = context
    console.log(application)

    if (permitType === STANDARD_RULES) {
      pageContext.templates = [
        { id: 'mcp-template-xls-link', name: 'Plant or generator list template (Excel XLS)', file: 'mcp-plant-generator-list-template-v0-1.xls' },
        { id: 'mcp-template-ods-link', name: 'Plant or generator list template (Open Document ODS)', file: 'mcp-plant-generator-list-template-v0-1.ods' }
      ]
    } else if (permitType === BESPOKE) {
      // TODO: Rather than the mcp type id being hard-coded here, pull in the MCP type ids (this is set in ../models/triage/triageLists, however the object name isn't exported (a different pattern than constants.js), so is unavailable.  Chat to Ben Sagar about it.)
      // TODO: Set the correct links and put the linked files in place, ready for download
      if (mcpType === 'stationary-mcp' || mcpType === 'stationary-mcp-sg' || mcpType === 'mobile-sg-mcp') {
        pageContext.templates = [
          { id: 'mcp-template-xls-link', name: 'Plant or generator list template APPENDIX 1 (Excel XLS)', file: 'todo' },
          { id: 'mcp-template-ods-link', name: 'Plant or generator list template APPENDIX 1 (Open Document ODS)', file: 'todo' }
        ]
      } else if (mcpType === 'stationary-sg' || mcpType === 'mobile-sg') {
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
