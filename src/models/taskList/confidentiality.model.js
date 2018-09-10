'use strict'

const { CONFIRM_CONFIDENTIALLY } = require('../applicationLine.model').CompletedParameters
const Completeness = require('./completeness.model')
const Application = require('../application.model')

module.exports = class Confidentiality extends Completeness {
  static get completenessParameter () {
    return CONFIRM_CONFIDENTIALLY
  }

  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.confidentiality !== undefined)
  }
}
