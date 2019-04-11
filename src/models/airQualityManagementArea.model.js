'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const IS_IN_AQMA = 'aqma-is-in-aqma'
const AQMA_NAME = 'aqma-name'
const NO2_LEVEL = 'aqma-nitrogen-dioxide-level'
const AUTH_NAME = 'aqma-local-authority-name'
const answerIds = [IS_IN_AQMA, AQMA_NAME, NO2_LEVEL, AUTH_NAME]
const YES = 'yes'
const NO = 'no'

module.exports = class AirQualityManagementArea {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    let applicationAnswers

    applicationAnswers = [{
      questionCode: IS_IN_AQMA,
      answerText: this.isInAqma ? YES : NO
    }]

    if (this.isInAqma) {
      applicationAnswers.push({
        questionCode: AQMA_NAME,
        answerText: this.name
      }, {
        questionCode: NO2_LEVEL,
        answerText: this.nitrogenDioxideLevel
      }, {
        questionCode: AUTH_NAME,
        answerText: this.localAuthorityName
      })
    }

    applicationAnswers.forEach(async (item) => {
      const applicationAnswer = new ApplicationAnswer(item)
      await applicationAnswer.save(context)
    })

    return null
  }

  static async get (context) {
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const isInAqmaAnswer = applicationAnswers.find(({ questionCode }) => questionCode === IS_IN_AQMA)
    const nameAnswer = applicationAnswers.find(({ questionCode }) => questionCode === AQMA_NAME)
    const nitrogenDioxideLevelAnswer = applicationAnswers.find(({ questionCode }) => questionCode === NO2_LEVEL)
    const localAuthorityNameAnswer = applicationAnswers.find(({ questionCode }) => questionCode === AUTH_NAME)

    const aqma = {
      isInAqma: isInAqmaAnswer && isInAqmaAnswer.answerText === YES,
      name: nameAnswer && nameAnswer.answerText,
      nitrogenDioxideLevel: nitrogenDioxideLevelAnswer && nitrogenDioxideLevelAnswer.answerText,
      localAuthorityName: localAuthorityNameAnswer && localAuthorityNameAnswer.answerText
    }

    return new AirQualityManagementArea(aqma)
  }
}
