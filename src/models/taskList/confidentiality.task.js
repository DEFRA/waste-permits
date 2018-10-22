'use strict'

const { CONFIRM_CONFIDENTIALLY } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Application = require('../../persistence/entities/application.entity')

module.exports = class Confidentiality extends BaseTask {
  static get completenessParameter () {
    return CONFIRM_CONFIDENTIALLY
  }

  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.confidentiality !== undefined)
  }
}
