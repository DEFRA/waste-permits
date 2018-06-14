'use strict'

const {SURFACE_DRAINAGE} = require('../../constants').Dynamics.CompletedParamters
const Completeness = require('./completeness.model')

module.exports = class DrainageTypeDrain extends Completeness {
  static get completenessParameter () {
    return SURFACE_DRAINAGE
  }
}
