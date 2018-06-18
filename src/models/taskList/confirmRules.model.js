'use strict'

const {CONFIRM_RULES} = require('../../constants').Dynamics.CompletedParamters
const Completeness = require('./completeness.model')

module.exports = class ConfirmRules extends Completeness {
  static get completenessParameter () {
    return CONFIRM_RULES
  }
}
