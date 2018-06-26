'use strict'

const {CONFIRM_RULES} = require('../../dynamics').CompletedParamters
const Completeness = require('./completeness.model')

module.exports = class ConfirmRules extends Completeness {
  static get completenessParameter () {
    return CONFIRM_RULES
  }
}
