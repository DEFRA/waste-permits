'use strict'

// const { HAZARDOUS_WASTE_TREATMENT_SUMMARY, HAZARDOUS_WASTE_PLANS } = require('../../constants').UploadSubject
const { CLINICAL_WASTE_JUSTIFICATION, CLINICAL_WASTE_TREATMENT_SUMMARY } = require('../../constants').UploadSubject
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class ClinicalWasteAppendix extends BaseTask {
  static async checkComplete (context) {
    const clinicalWasteJustification = await Annotation.listByApplicationIdAndSubject(context, CLINICAL_WASTE_JUSTIFICATION)
    if (!clinicalWasteJustification.length) {
      return false
    }

    const clinicalWasteSummary = await Annotation.listByApplicationIdAndSubject(context, CLINICAL_WASTE_TREATMENT_SUMMARY)
    if (!clinicalWasteSummary.length) {
      return false
    }

    return true
  }
}
