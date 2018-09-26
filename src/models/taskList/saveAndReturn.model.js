'use strict'

const { SAVE_AND_RETURN_EMAIL } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')
const Application = require('../application.model')

module.exports = class SaveAndReturn extends Completeness {
  static get completenessParameter () {
    return SAVE_AND_RETURN_EMAIL
  }

  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.saveAndReturnEmail)
  }
}
