'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const { ApplicationQuestions } = require('../dynamics')
const { CLIMATE_CHANGE_RISK_SCREENING } = ApplicationQuestions
const { PERMIT_LENGTH, FLOOD_RISK, WATER_SOURCE } = CLIMATE_CHANGE_RISK_SCREENING

const answerIds = [
  PERMIT_LENGTH.questionCode,
  FLOOD_RISK.questionCode,
  WATER_SOURCE.questionCode
]

const permitLengthScores = {
  'less-than-5': 0,
  'between-2020-and-2040': 1,
  'between-2040-and-2060': 3,
  'until-2060-or-beyond': 5
}

const floodRiskScores = {
  'not-in-flood-risk-zone': 0,
  'very-low-or-low': 1,
  'medium': 2,
  'high': 5
}

const waterSourceScores = {
  'water-not-required': 0,
  'mains-water': 1,
  'surface-or-ground': 5
}

module.exports = class ClimateChangeRiskScreening {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  static async isUploadRequired (climateChangeRiskScreening) {
    const { permitLength, floodRisk, waterSource } = climateChangeRiskScreening

    // Upload is never required if permit length is less than 5
    if (await this.isPermitLengthLessThan5(climateChangeRiskScreening)) { return false }

    if (permitLength && floodRiskScores && waterSource) {
      const score = permitLengthScores[permitLength] +
      floodRiskScores[floodRisk] +
      waterSourceScores[waterSource]

      return score >= 5
    }

    return undefined
  }

  static async isPermitLengthLessThan5 (climateChangeRiskScreening) {
    const { permitLength } = climateChangeRiskScreening
    return permitLength === 'less-than-5'
  }

  async save (context) {
    let applicationAnswers = []

    if (this.permitLength) { applicationAnswers.push({ questionCode: PERMIT_LENGTH.questionCode, answerText: this.permitLength }) }
    if (this.floodRisk) { applicationAnswers.push({ questionCode: FLOOD_RISK.questionCode, answerText: this.floodRisk }) }
    if (this.waterSource) { applicationAnswers.push({ questionCode: WATER_SOURCE.questionCode, answerText: this.waterSource }) }

    applicationAnswers.forEach(async (item) => {
      const applicationAnswer = new ApplicationAnswer(item)
      await applicationAnswer.save(context)
    })

    return null
  }

  static async get (context) {
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const permitLengthAnswer = applicationAnswers.find(({ questionCode }) => questionCode === PERMIT_LENGTH.questionCode)
    const floodRiskAnswer = applicationAnswers.find(({ questionCode }) => questionCode === FLOOD_RISK.questionCode)
    const waterSourceAnswer = applicationAnswers.find(({ questionCode }) => questionCode === WATER_SOURCE.questionCode)

    const climateChange = {
      permitLength: permitLengthAnswer && permitLengthAnswer.answerText,
      floodRisk: floodRiskAnswer && floodRiskAnswer.answerText,
      waterSource: waterSourceAnswer && waterSourceAnswer.answerText
    }

    return new ClimateChangeRiskScreening(climateChange)
  }
}
