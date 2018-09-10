'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const { INDIVIDUAL, SOLE_TRADER, LIMITED_LIABILITY_PARTNERSHIP } = require('../../dynamics').PERMIT_HOLDER_TYPES
const { PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH, COMPANY_NUMBER, LLP_COMPANY_NUMBER } = require('../../routes')

module.exports = class PermitHolderDetailsController extends BaseController {
  async doGet (request, h) {
    const { permitHolderType } = await RecoveryService.createApplicationContext(h)

    switch (permitHolderType) {
      case undefined:
        throw new Error('Permit Holder Type is undefined')
      case INDIVIDUAL:
      case SOLE_TRADER:
        // Re-direct to individual details flow
        return this.redirect({ request, h, redirectPath: PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH.path })
      case LIMITED_LIABILITY_PARTNERSHIP:
        // Re-direct to limited liability partnership details flow
        return this.redirect({ request, h, redirectPath: LLP_COMPANY_NUMBER.path })
      default:
        // Re-direct to company details flow
        return this.redirect({ request, h, redirectPath: COMPANY_NUMBER.path })
    }
  }
}
