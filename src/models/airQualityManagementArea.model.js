'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const ID_PREFIX = 'aqma-'
const IS_IN_AQMA = `${ID_PREFIX}is-in-aqma`
const AQMA_NAME = `${ID_PREFIX}name`
const NO2_LEVEL = `${ID_PREFIX}nitrogen-dioxide-level`
const AUTH_NAME = `${ID_PREFIX}local-authority-name`
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
      answerCode: this.isInAqma ? YES : NO,
      answerText: undefined
    }]

    if (this.isInAqma) {
      applicationAnswers.push({
        questionCode: AQMA_NAME,
        answerCode: undefined,
        answerText: this.name
      }, {
        questionCode: NO2_LEVEL,
        answerCode: undefined,
        answerText: this.nitrogenDioxideLevel
      }, {
        questionCode: AUTH_NAME,
        answerCode: undefined,
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
    const aqmaNameAnswer = applicationAnswers.find(({ questionCode }) => questionCode === AQMA_NAME)
    const nitrogenDioxideLevelAnswer = applicationAnswers.find(({ questionCode }) => questionCode === NO2_LEVEL)
    const localAuthorityNameAnswer = applicationAnswers.find(({ questionCode }) => questionCode === AUTH_NAME)

    const aqma = {
      aqmaIsInAqma: isInAqmaAnswer && isInAqmaAnswer.answerCode === true,
      aqmaName: aqmaNameAnswer && aqmaNameAnswer.answerText,
      aqmaNitrogenDioxideLevel: nitrogenDioxideLevelAnswer && nitrogenDioxideLevelAnswer.answerText,
      aqmaLocalAuthorityName: localAuthorityNameAnswer && localAuthorityNameAnswer.answerText
    }

    return new AirQualityManagementArea(aqma)
  }
}
