'use strict'

const BaseTask = require('./base.task')
const ApplicationReturn = require('../../persistence/entities/applicationReturn.entity')

module.exports = class SaveAndReturn extends BaseTask {
  static async checkComplete (context) {
    const { applicationId } = context
    const applicationReturn = await ApplicationReturn.getByApplicationId(context, applicationId)
    return Boolean(applicationReturn && applicationReturn.slug)
  }
}
