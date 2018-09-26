'use strict'

const Constants = require('../../constants')
const { TECHNICAL_QUALIFICATION } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')
const Annotation = require('../annotation.model')

module.exports = class TechnicalQualification extends Completeness {
  static get completenessParameter () {
    return TECHNICAL_QUALIFICATION
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.TECHNICAL_QUALIFICATION)
    return Boolean(evidence.length)
  }
}
