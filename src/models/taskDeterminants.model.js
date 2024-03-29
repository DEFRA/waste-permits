'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const Item = require('../persistence/entities/item.entity')
const StandardRuleType = require('../persistence/entities/standardRuleType.entity')
const DataStore = require('../models/dataStore.model')
const { PermitTypes } = require('../constants')
const { FACILITY_TYPES, MCP_TYPES, ApplicationQuestions } = require('../dynamics')
const { MCP_PERMIT_TYPES } = ApplicationQuestions

module.exports = class TaskDeterminants {
  constructor (data = {}) {
    Object.entries(data).forEach(([prop, val]) => {
      this[prop] = val
    })
    this.__originalVals = {}
  }

  _extendItemArray (array, all) {
    // Now extend the items array to override the push function to push the item data if only a string was supplied
    const items = []
    items._defra_push = items.push
    items._defra_taskDeterminants = this
    items.push = (item) => {
      if (typeof item === 'string') {
        item = items._defra_taskDeterminants[all].find(({ shortName }) => item === shortName)
      }
      items._defra_push(item)
      return items
    }
    array.forEach((item) => items.push(item))
    return items
  }

  async _saveAnswer ({ questionCode }, data) {
    const applicationAnswer = new ApplicationAnswer({ questionCode })
    Object.assign(applicationAnswer, data)
    await applicationAnswer.save(this.context)
  }

  static async _getAnswer (context, { questionCode }) {
    return ApplicationAnswer.getByQuestionCode(context, questionCode) || {}
  }

  _hasChanged (prop) {
    return this.__originalVals[prop] !== this[prop]
  }

  async save (params) {
    if (params) {
      Object.entries(params).forEach(([prop, val]) => {
        this[prop] = val
      })
    }
    const {
      _permitCategory = {},
      _permitType = {},
      _mcpType = {},
      _facilityType = {},
      _wasteAssessments = [],
      airDispersionModellingRequired = false,
      energyEfficiencyReportRequired = false,
      bestAvailableTechniquesAssessment = false,
      habitatAssessmentRequired = false,
      aqmaRequired = false,
      siteNameRequired = false,
      businessActivityRequired = false,
      screeningToolRequired = false,
      receivedPreApplicationAdvice = false
    } = this

    if (this._hasChanged('mcpType')) {
      await this._saveAnswer(MCP_PERMIT_TYPES, { answerCode: _mcpType.id })
    }

    const data = {
      permitCategory: _permitCategory.id,
      permitType: _permitType.id,
      facilityType: _facilityType.id,
      wasteAssessments: _wasteAssessments.filter((assessment) => typeof assessment === 'object').map(({ shortName }) => shortName).join(','),
      airDispersionModellingRequired,
      energyEfficiencyReportRequired,
      bestAvailableTechniquesAssessment,
      habitatAssessmentRequired,
      aqmaRequired,
      siteNameRequired,
      businessActivityRequired,
      screeningToolRequired,
      receivedPreApplicationAdvice
    }
    await DataStore.save(this.context, data)
  }

  static async get (context) {
    const [
      { data = {} },
      allAssessments,
      allCategories,
      { answerCode: mcpType }
    ] = await Promise.all([
      await DataStore.get(context),
      Item.listWasteAssessments(context),
      StandardRuleType.getCategories(context),
      await TaskDeterminants._getAnswer(context, MCP_PERMIT_TYPES) || {}
    ])

    const determinants = Object.assign({ mcpType, allAssessments, allCategories }, data)
    const taskDeterminants = new TaskDeterminants({ context, ...determinants })

    // Save original values so that when we save the data, we don't bother to save unchanged values.
    taskDeterminants.__originalVals = determinants

    return taskDeterminants
  }

  /// permitCategory ///

  set permitCategory (permitCategory) {
    if (typeof permitCategory === 'string') {
      permitCategory = this.allCategories.find(({ id }) => id === permitCategory)
    }
    this._permitCategory = permitCategory
  }

  get permitCategory () {
    return this._permitCategory
  }

  /// permitType ///

  set permitType (permitType) {
    if (typeof permitType === 'string') {
      permitType = Object.values(PermitTypes).find(({ id }) => id === permitType)
    }
    this._permitType = permitType
  }

  get permitType () {
    return this._permitType
  }

  /// facilityType ///

  set facilityType (facilityType) {
    if (typeof facilityType === 'string') {
      facilityType = Object.values(FACILITY_TYPES).find(({ id }) => id === facilityType)
    }
    this._facilityType = facilityType
  }

  get facilityType () {
    return this._facilityType
  }

  /// mcpType ///

  set mcpType (mcpType) {
    if (typeof mcpType === 'string') {
      mcpType = Object.values(MCP_TYPES).find(({ id }) => id === mcpType)
    }
    this._mcpType = mcpType
  }

  get mcpType () {
    return this._mcpType
  }

  /// wasteAssessments ///

  set wasteAssessments (wasteAssessments) {
    if (typeof wasteAssessments === 'string') {
      wasteAssessments = wasteAssessments.split(',').filter((item) => item)
    }
    this._wasteAssessments = this._extendItemArray(wasteAssessments, 'allAssessments')
  }

  get wasteAssessments () {
    return this._wasteAssessments
  }
}
