'use strict'

const BaseController = require('./base.controller')
const { WASTE_WEIGHT: { path: wasteWeightBasePath } } = require('../routes')

module.exports = class WasteWeightsController extends BaseController {
  async doGet (request, h) {
    return this.redirect({ h, path: `${wasteWeightBasePath}/0` })
  }
}
