'use strict'

const Constants = require('../../constants')
const {FIRE_PREVENTION_PLAN} = require('../applicationLine.model').CompletedParameters
const Completeness = require('./completeness.model')
const Annotation = require('../annotation.model')

module.exports = class FirePreventionPlan extends Completeness {
  static get completenessParameter () {
    return FIRE_PREVENTION_PLAN
  }

  static async checkComplete (context, applicationId) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, applicationId, Constants.UploadSubject.FIRE_PREVENTION_PLAN)
    return Boolean(evidence.length)
  }
}
