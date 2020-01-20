'use strict'

const BaseTask = require('./base.task')
const PreApplicationModel = require('../preApplication.model')

module.exports = class PreApplication extends BaseTask {
  static async checkComplete (context) {
    const preApplication = await PreApplicationModel.get(context)
    return Boolean(preApplication.preApplicationReference)
  }
}
