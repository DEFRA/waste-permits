'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const {INDIVIDUAL, SOLE_TRADER} = Constants.PERMIT_HOLDER_TYPES

module.exports = class PermitHolderDetailsController extends BaseController {
  async doGet (request, h) {
    const {permitHolderType} = await RecoveryService.createApplicationContext(h)

    switch (permitHolderType) {
      case INDIVIDUAL:
      case SOLE_TRADER:
        // Re-direct to individual details flow
        return this.redirect({request, h, redirectPath: Constants.Routes.PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH.path})
      default:
        // Re-direct to company details flow
        return this.redirect({request, h, redirectPath: Constants.Routes.COMPANY_NUMBER.path})
    }
  }
}
