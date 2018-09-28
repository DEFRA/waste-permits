'use strict'

const { CONFIRM_RULES } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')

module.exports = class ConfirmRules extends Completeness {
  static get completenessParameter () {
    return CONFIRM_RULES
  }
}
