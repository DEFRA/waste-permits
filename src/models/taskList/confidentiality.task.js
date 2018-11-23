'use strict'

const BaseTask = require('./base.task')

module.exports = class Confidentiality extends BaseTask {
  static async checkComplete (context) {
    const { application } = context
    return Boolean(application.confidentiality !== undefined)
  }
}
