'use strict'

const { MINING_DATA } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')
const Application = require('../../persistence/entities/application.entity')

module.exports = class MiningWasteDetails extends BaseTask {
  static get completenessParameter () {
    return MINING_DATA
  }

  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.miningWastePlan && application.miningWasteWeight)
  }
}
