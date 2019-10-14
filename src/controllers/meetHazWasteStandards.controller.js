'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MANAGE_HAZARDOUS_WASTE: { MEET_STANDARDS: { questionCode } } } = require('../dynamics').ApplicationQuestions
// const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const DataStore = require('../models/dataStore.model')
const { HAZARDOUS_WASTE_PROPOSAL_UPLOAD } = require('../routes')

const FORM_FIELD_NAME = 'meet-standards'

module.exports = class MeetHazWasteStandardsController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const pageContext = this.createPageContext(h, errors)

    let meetStandards
    if (request.payload) {
      meetStandards = request.payload[FORM_FIELD_NAME]
    } else {
      // TODO: Use application answers so this information can be accessed in the back end
      //   const meetStandardsAnswer = await ApplicationAnswer.getByQuestionCode(context, questionCode)
      //   meetStandards = meetStandardsAnswer && meetStandardsAnswer.answerCode
      const dataStore = await DataStore.get(context)
      meetStandards = dataStore.data[questionCode]
    }
    if (['yes', 'no'].includes(meetStandards)) {
      pageContext[meetStandards + 'Selected'] = true
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const meetStandards = request.payload[FORM_FIELD_NAME]

    // TODO: Save this as an application answer - it requires the lookup value to be established in the back end
    //   const meetStandardsAnswer = new ApplicationAnswer({ questionCode })
    //   meetStandardsAnswer.answerCode = meetStandards
    //   await meetStandardsAnswer.save(context)

    const dataStore = await DataStore.get(context)
    dataStore.data[questionCode] = meetStandards
    await dataStore.save(context)

    if (meetStandards === 'no') {
      return this.redirect({ h, path: HAZARDOUS_WASTE_PROPOSAL_UPLOAD.path })
    }

    return this.redirect({ h })
  }
}
