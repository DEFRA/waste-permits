'use strict'

const BaseTask = require('./base.task')

module.exports = class MiningWasteDetails extends BaseTask {
  static async checkComplete (context) {
    const { application } = context
    return Boolean(application.miningWastePlan && application.miningWasteWeight)
  }
}
