'use strict'

const { SAVE_AND_RETURN_EMAIL } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Application = require('../../persistence/entities/application.entity')

module.exports = class SaveAndReturn extends BaseTask {
  static get completenessParameter () {
    return SAVE_AND_RETURN_EMAIL
  }

  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.saveAndReturnEmail)
  }
}
