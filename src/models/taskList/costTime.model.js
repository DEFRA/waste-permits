'use strict'

const { SHOW_COST_AND_TIME } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')

module.exports = class CostTime extends Completeness {
  static get completenessParameter () {
    return SHOW_COST_AND_TIME
  }
}
