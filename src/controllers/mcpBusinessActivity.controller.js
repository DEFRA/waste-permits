'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const McpBusinessType = require('../models/mcpBusinessType.model')

const OTHER_CODE = 'other'

module.exports = class McpBusinessActivityController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const pageContext = this.createPageContext(h, errors)

    let selectedValue
    if (request.payload) {
      selectedValue = McpBusinessActivityController.determineSelectedValueFromPayload(request.payload)
    } else {
      const mcpBusinessType = await McpBusinessType.get(context)
      if (mcpBusinessType) {
        selectedValue = mcpBusinessType.code
      }
    }
    const mainTypes = McpBusinessType.getMcpMainBusinessTypesList()

    mainTypes.forEach((item) => {
      item.id = item.code.replace(/\./g, '-')
    })
    pageContext.mainTypes = mainTypes

    if (selectedValue) {
      const foundType = mainTypes.find(({ code }) => code === selectedValue)
      if (foundType) {
        foundType.isSelected = true
      } else {
        pageContext.otherIsSelected = true
        pageContext.other = selectedValue
      }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)
    const selectedValue = McpBusinessActivityController.determineSelectedValueFromPayload(request.payload)

    await McpBusinessType.save(context, selectedValue)

    return this.redirect({ h })
  }

  static determineSelectedValueFromPayload (payload) {
    const {
      'type-codes-option': typeCodeOption,
      'type-codes-other': typeCodeOther
    } = payload

    return typeCodeOption === OTHER_CODE ? (typeCodeOther || OTHER_CODE) : typeCodeOption
  }
}
