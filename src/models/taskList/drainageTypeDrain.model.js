'use strict'

const { SURFACE_DRAINAGE } = require('../taskList/taskList.model').CompletedParameters
const Completeness = require('./completeness.model')

module.exports = class DrainageTypeDrain extends Completeness {
  static get completenessParameter () {
    return SURFACE_DRAINAGE
  }
}
