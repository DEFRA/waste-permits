'use strict'

const Constants = require('../../constants')
const { SITE_PLAN } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class SitePlan extends BaseTask {
  static get completenessParameter () {
    return SITE_PLAN
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.SITE_PLAN)
    return Boolean(evidence.length)
  }
}
