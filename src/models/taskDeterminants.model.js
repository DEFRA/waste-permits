'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const Item = require('../persistence/entities/item.entity')
const DataStore = require('../models/dataStore.model')
const { PermitTypes } = require('../constants')
const { FACILITY_TYPES, MCP_TYPES, ApplicationQuestions } = require('../dynamics')
const { MCP_PERMIT_TYPES } = ApplicationQuestions

module.exports = class TaskDeterminants {
  constructor (data = {}) {
    Object.entries(data).forEach(([prop, val]) => {
      this[prop] = val
    })
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

  async save (params) {
    if (params) {
      Object.entries(params).forEach(([prop, val]) => {
        this[prop] = val
      })
    }
    const {
      _permitType = {},
      _mcpType = {},
      _facilityType = {},
      _wasteActivities = [],
      _wasteAssessments = [],
      airDispersionModellingRequired = false,
      energyEfficiencyReportRequired = false,
      bestAvailableTechniquesAssessment = false,
      habitatAssessmentRequired = false
    } = this

    await this._saveAnswer(MCP_PERMIT_TYPES, { answerCode: _mcpType.id })

    const data = {
      permitType: _permitType.id,
      facilityType: _facilityType.id,
      wasteActivities: _wasteActivities,
      wasteAssessments: _wasteAssessments,
      airDispersionModellingRequired,
      energyEfficiencyReportRequired,
      bestAvailableTechniquesAssessment,
      habitatAssessmentRequired
    }
    await DataStore.save(this.context, data)
  }

  static async get (context) {
    const [{ data = {} }, allActivities, allAssessments, { answerCode: mcpType }] = await Promise.all([
      await DataStore.get(context),
      Item.listWasteActivities(context),
      Item.listWasteAssessments(context),
      await TaskDeterminants._getAnswer(context, MCP_PERMIT_TYPES) || {}
    ])

    Object.assign(data, { mcpType, allActivities, allAssessments })
    return new TaskDeterminants({ context, ...data })
  }

  /// facilityType ///

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

  /// wasteActivities ///

  set wasteActivities (wasteActivities) {
    this._wasteActivities = this._extendItemArray(wasteActivities, 'allActivities')
  }

  get wasteActivities () {
    return this._wasteActivities
  }

  /// wasteAssessments ///

  set wasteAssessments (wasteAssessments) {
    this._wasteAssessments = this._extendItemArray(wasteAssessments, 'allAssessments')
  }

  get wasteAssessments () {
    return this._wasteAssessments
  }
}
