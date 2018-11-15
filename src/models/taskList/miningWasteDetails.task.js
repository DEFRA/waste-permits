'use strict'

const BaseTask = require('./base.task')
const Application = require('../../persistence/entities/application.entity')

module.exports = class MiningWasteDetails extends BaseTask {
  static async checkComplete (context, applicationId) {
    const application = await Application.getById(context, applicationId)
    return Boolean(application.miningWastePlan && application.miningWasteWeight)
  }
}
