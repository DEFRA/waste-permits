'use strict'

const Constants = require('../constants')
const BaseController = require('./base.controller')

module.exports = class PermitHolderDetailsController extends BaseController {
  async doGet (request, h) {
    // Re-direct to company details flow
    return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_NUMBER.path})
  }
}
