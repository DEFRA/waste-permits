'use strict'

const {CONFIRM_RULES} = require('../applicationLine.model').CompletedParameters
const Completeness = require('./completeness.model')

module.exports = class ConfirmRules extends Completeness {
  static get completenessParameter () {
    return CONFIRM_RULES
  }
}
