'use strict'

const BaseController = require('./base.controller')
const { WASTE_RD_DISPOSAL: { path: wasteDisposalCodesBasePath } } = require('../routes')

module.exports = class WasteDisposalAndRecoveryCodesController extends BaseController {
  async doGet (request, h) {
    return this.redirect({ h, path: `${wasteDisposalCodesBasePath}/0` })
  }
}
