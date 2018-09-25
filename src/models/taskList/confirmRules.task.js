'use strict'

const { CONFIRM_RULES } = require('./taskList').CompletedParameters
const BaseTask = require('./base.task')

module.exports = class ConfirmRules extends BaseTask {
  static get completenessParameter () {
    return CONFIRM_RULES
  }
}
