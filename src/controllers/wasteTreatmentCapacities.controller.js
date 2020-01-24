'use strict'

const BaseController = require('./base.controller')
const { WASTE_TREATMENT_CAPACITY_TYPES: { path: wasteTreatmentCapacityBasePath } } = require('../routes')

module.exports = class WasteTreatmentCapacities extends BaseController {
  async doGet (request, h) {
    return this.redirect({ h, path: `${wasteTreatmentCapacityBasePath}/0` })
  }
}
