'use strict'

const { HAZARDOUS_WASTE_PROPOSAL, HAZARDOUS_WASTE_TREATMENT_SUMMARY, HAZARDOUS_WASTE_PLANS } = require('../../constants').UploadSubject
const { MANAGE_HAZARDOUS_WASTE: { MEET_STANDARDS, LIST_PROCEDURES } } = require('../../dynamics').ApplicationQuestions
const BaseTask = require('./base.task')
// const ApplicationAnswer = require('../../persistence/entities/applicationAnswer.entity')
const DataStore = require('../../models/dataStore.model')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class ManageHazardousWaste extends BaseTask {
  static async checkComplete (context) {
    // TODO: Use application answers so this information can be accessed in the back end
    //   const meetStandardsAnswer = await ApplicationAnswer.getByQuestionCode(context, MEET_STANDARDS.questionCode)
    //   if (!meetStandardsAnswer) {
    //     return false
    //   }
    //   if (meetStandardsAnswer.answerCode === 'yes') {
    //     const proceduresAnswer = await ApplicationAnswer.getByQuestionCode(context, LIST_PROCEDURES.questionCode)
    //     if (!proceduresAnswer || !proceduresAnswer.answerText) {
    //       return false
    //     }
    //   } else if (meetStandardsAnswer.answerCode === 'no') {
    //     const proposal = await Annotation.listByApplicationIdAndSubject(context, HAZARDOUS_WASTE_PROPOSAL)
    //     if (!proposal.length) {
    //       return false
    //     }
    //   } else {
    //     return false
    //   }
    const dataStore = await DataStore.get(context)
    if (dataStore.data[MEET_STANDARDS.questionCode] === 'yes') {
      if (!dataStore.data[LIST_PROCEDURES.questionCode]) {
        return false
      }
    } else if (dataStore.data[MEET_STANDARDS.questionCode] === 'no') {
      const proposal = await Annotation.listByApplicationIdAndSubject(context, HAZARDOUS_WASTE_PROPOSAL)
      if (!proposal.length) {
        return false
      }
    } else {
      return false
    }

    const treatmentSummary = await Annotation.listByApplicationIdAndSubject(context, HAZARDOUS_WASTE_TREATMENT_SUMMARY)
    if (!treatmentSummary.length) {
      return false
    }

    const layoutPlansAndProcessFlows = await Annotation.listByApplicationIdAndSubject(context, HAZARDOUS_WASTE_PLANS)
    if (!layoutPlansAndProcessFlows.length) {
      return false
    }

    return true
  }
}
