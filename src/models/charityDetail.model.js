
const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const DataStore = require('../models/dataStore.model')
const { INDIVIDUAL, LIMITED_COMPANY, PUBLIC_BODY } = require('../dynamics').PERMIT_HOLDER_TYPES

const { CHARITY_DETAILS: {
  NAME: { questionCode: questionCodeName },
  NUMBER: { questionCode: questionCodeNumber }
} } = require('../dynamics').ApplicationQuestions

module.exports = class CharityDetail {
  constructor (data) {
    Object.assign(this, data)
  }

  static _getByCode (applicationAnswers, code) {
    return applicationAnswers.filter(({ questionCode }) => questionCode === code).pop() || {}
  }

  get isIndividual () {
    return this.charityPermitHolder === INDIVIDUAL.id
  }

  static async get (context) {
    const { application } = context
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, [questionCodeName, questionCodeNumber])
    // Default the charity name to the trading name if it exists.
    const { answerText: charityName = application.tradingName } = this._getByCode(applicationAnswers, questionCodeName)
    const { answerText: charityNumber } = this._getByCode(applicationAnswers, questionCodeNumber)
    const { data: { charityPermitHolder } } = await DataStore.get(context)
    context.charityDetail = new CharityDetail({ charityName, charityNumber, charityPermitHolder })
    return context.charityDetail
  }

  async save (context) {
    const { application } = context
    const { charityName, charityNumber, charityPermitHolder } = this
    switch (charityPermitHolder) {
      case PUBLIC_BODY.id:
        application.tradingName = charityName
        application.applicantType = PUBLIC_BODY.dynamicsApplicantTypeId
        application.organisationType = PUBLIC_BODY.dynamicsOrganisationTypeId
        break
      case INDIVIDUAL.id:
        application.tradingName = undefined
        application.applicantType = INDIVIDUAL.dynamicsApplicantTypeId
        application.organisationType = INDIVIDUAL.dynamicsOrganisationTypeId
        break
      case LIMITED_COMPANY.id:
        application.tradingName = undefined
        application.applicantType = LIMITED_COMPANY.dynamicsApplicantTypeId
        application.organisationType = LIMITED_COMPANY.dynamicsOrganisationTypeId
        break
      default:
        throw new Error(`Unexpected charityPermitHolder: ${charityPermitHolder}`)
    }
    await application.save(context)
    await DataStore.save(context, { charityPermitHolder })
    const answers = [
      {
        questionCode: questionCodeNumber,
        answerText: charityNumber
      }, {
        questionCode: questionCodeName,
        answerText: charityName
      }
    ]

    return Promise.all(answers.map((answer) => {
      const applicationAnswer = new ApplicationAnswer(answer)
      return applicationAnswer.save(context)
    }))
  }

  async delete (context) {
    const { application } = context
    const { charityPermitHolder } = this
    if (charityPermitHolder === PUBLIC_BODY.id) {
      application.tradingName = undefined
      await application.save(context)
    }
    const dataStore = await DataStore.get(context)
    if (dataStore && dataStore.data && dataStore.data.charityPermitHolder) {
      delete dataStore.data.charityPermitHolder
      await dataStore.save(context)
    }
    const applicationAnswers = await ApplicationAnswer.listByMultipleQuestionCodes(context, [questionCodeName, questionCodeNumber])
    return Promise.all(applicationAnswers.map((applicationAnswer) => {
      return applicationAnswer.clear(context)
    }))
  }
}
