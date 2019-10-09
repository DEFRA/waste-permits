'use strict'

const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')

const { CLINICAL_WASTE_DOCUMENTS } = require('../dynamics').ApplicationQuestions
const { MEET_STANDARDS } = CLINICAL_WASTE_DOCUMENTS

const YES = 'yes'
const NO = 'no'

module.exports = class ClinicalWasteDocumentsMeetStandards {
  constructor (data = {}) {
    Object.entries(data).forEach(([field, value]) => {
      this[field] = value
    })
  }

  async save (context) {
    let answer

    answer = {
      questionCode: MEET_STANDARDS,
      answerText: this.clinicalWasteDocumentsMeetStandards ? YES : NO
    }

    const applicationAnswer = new ApplicationAnswer(answer)
    await applicationAnswer.save(context)

    return null
  }

  static async get (context) {
    const answer = await ApplicationAnswer.getByQuestionCode(context, MEET_STANDARDS)

    const clinicalWasteDocumentsMeetStandards = {
      clinicalWasteDocumentsMeetStandards: answer && answer.answerText === YES
    }

    return new ClinicalWasteDocumentsMeetStandards(clinicalWasteDocumentsMeetStandards)
  }
}
