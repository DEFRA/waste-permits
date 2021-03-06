'use strict'

const Constants = require('../../constants')
const BaseTask = require('./base.task')
const Annotation = require('../../persistence/entities/annotation.entity')

module.exports = class PestManagementPlan extends BaseTask {
  static async checkComplete (context) {
    const evidence = await Annotation.listByApplicationIdAndSubject(context, Constants.UploadSubject.PEST_MANAGEMENT_PLAN)
    return Boolean(evidence.length)
  }
}
