'use strict'

const BaseController = require('./base.controller')
const RecoveryService = require('../services/recovery.service')
const { MANAGE_HAZARDOUS_WASTE: { LIST_PROCEDURES: { questionCode } } } = require('../dynamics').ApplicationQuestions
// const ApplicationAnswer = require('../persistence/entities/applicationAnswer.entity')
const DataStore = require('../models/dataStore.model')

const FORM_FIELD_NAME = 'procedures-list'

module.exports = class ListHazWasteProceduresController extends BaseController {
  async doGet (request, h, errors) {
    const context = await RecoveryService.createApplicationContext(h)
    const pageContext = this.createPageContext(h, errors)

    if (request.payload) {
      pageContext.formValues = request.payload
    } else {
      // TODO: Use application answers so this information can be accessed in the back end
      //   const proceduresAnswer = await ApplicationAnswer.getByQuestionCode(context, questionCode)
      //   if (proceduresAnswer && proceduresAnswer.answerText) {
      //     pageContext.formValues = { [FORM_FIELD_NAME]: proceduresAnswer.answerText }
      //   }
      const dataStore = await DataStore.get(context)
      pageContext.formValues = { [FORM_FIELD_NAME]: dataStore.data[questionCode] }
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    const context = await RecoveryService.createApplicationContext(h)

    const procedures = request.payload[FORM_FIELD_NAME]

    // TODO: Save this as an application answer - it requires the lookup value to be established in the back end
    //   const proceduresAnswer = new ApplicationAnswer({ questionCode })
    //   procedures.answerText = procedures
    //   await proceduresAnswer.save(context)

    const dataStore = await DataStore.get(context)
    dataStore.data[questionCode] = procedures
    await dataStore.save(context)

    return this.redirect({ h })
  }
}
