'use strict'

const {SHOW_COST_AND_TIME} = require('../../dynamics').CompletedParamters
const Completeness = require('./completeness.model')

module.exports = class CostTime extends Completeness {
  static get completenessParameter () {
    return SHOW_COST_AND_TIME
  }
}
