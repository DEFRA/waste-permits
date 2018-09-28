'use strict'

const Constants = require('../../constants')
const { SITE_PLAN } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')
const Annotation = require('../annotation.model')

module.exports = class SitePlan extends Completeness {
  static get completenessParameter () {
    return SITE_PLAN
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.SITE_PLAN)
    return Boolean(evidence.length)
  }
}
