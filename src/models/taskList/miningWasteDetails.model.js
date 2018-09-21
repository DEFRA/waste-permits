'use strict'

const { MINING_DATA } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')
const Application = require('../../../src/models/application.model')

module.exports = class MiningWasteDetails extends Completeness {
  static get completenessParameter () {
    return MINING_DATA
  }

  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.miningWastePlan && application.miningWasteWeight)
  }
}
