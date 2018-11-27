'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const ID_PREFIX = 'waste-operation-release-to-'
const SEWER = `${ID_PREFIX}sewer`
const HARBOUR = `${ID_PREFIX}harbour`
const FISHERIES = `${ID_PREFIX}sea-fisheries`
const answerIds = [SEWER, HARBOUR, FISHERIES]
const YES = 'yes'
const NO = 'no'

module.exports = class NeedToConsult {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    let applicationAnswers
    if (this.none) {
      // Save all three 'no' answers
      applicationAnswers = [{
        questionCode: SEWER,
        answerCode: NO,
        answerText: undefined
      }, {
        questionCode: HARBOUR,
        answerCode: NO,
        answerText: undefined
      }, {
        questionCode: FISHERIES,
        answerCode: NO,
        answerText: undefined
      }]
    } else {
      applicationAnswers = [{
        questionCode: SEWER,
        answerCode: this.sewer ? YES : NO,
        answerText: this.sewer ? this.sewerageUndertaker : undefined
      }, {
        questionCode: HARBOUR,
        answerCode: this.harbour ? YES : NO,
        answerText: this.harbour ? this.harbourAuthority : undefined
      }, {
        questionCode: FISHERIES,
        answerCode: this.fisheries ? YES : NO,
        answerText: this.fisheries ? this.fisheriesCommittee : undefined
      }]
    }

    applicationAnswers.forEach(async (item) => {
      const applicationAnswer = new ApplicationAnswer(item)
      await applicationAnswer.save(context)
    })

    return null
  }

  static async get (context) {
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, answerIds)
    const sewerAnswer = applicationAnswers.find(({ questionCode }) => questionCode === SEWER)
    const harbourAnswer = applicationAnswers.find(({ questionCode }) => questionCode === HARBOUR)
    const fisheriesAnswer = applicationAnswers.find(({ questionCode }) => questionCode === FISHERIES)

    const consult = {
      sewer: sewerAnswer && sewerAnswer.answerCode === YES,
      sewerageUndertaker: sewerAnswer && sewerAnswer.answerText,
      harbour: harbourAnswer && harbourAnswer.answerCode === YES,
      harbourAuthority: harbourAnswer && harbourAnswer.answerText,
      fisheries: fisheriesAnswer && fisheriesAnswer.answerCode === YES,
      fisheriesCommittee: fisheriesAnswer && fisheriesAnswer.answerText,
      none:
        (sewerAnswer && sewerAnswer.answerCode === NO) &&
        (harbourAnswer && harbourAnswer.answerCode === NO) &&
        (fisheriesAnswer && fisheriesAnswer.answerCode === NO)
    }

    return new NeedToConsult(consult)
  }
}
