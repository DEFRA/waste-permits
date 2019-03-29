'use strict'

const BaseController = require('../base.controller')
const RecoveryService = require('../../services/recovery.service')

const {
  INDIVIDUAL,
  PARTNERSHIP,
  SOLE_TRADER,
  LIMITED_LIABILITY_PARTNERSHIP,
  PUBLIC_BODY,
  CHARITY_OR_TRUST,
  OTHER_ORGANISATION
} = require('../../dynamics').PERMIT_HOLDER_TYPES

const {
  PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH,
  COMPANY_NUMBER,
  LLP_COMPANY_NUMBER,
  PARTNERSHIP_TRADING_NAME,
  PUBLIC_BODY_NAME,
  CHARITY_PERMIT_HOLDER,
  PERMIT_GROUP_DECIDE,
  PERMIT_HOLDER_TYPE
} = require('../../routes')

module.exports = class PermitHolderDetailsController extends BaseController {
  async doGet (request, h) {
    const { permitHolderType, charityDetail = {} } = await RecoveryService.createApplicationContext(h)
    const { charityPermitHolder } = charityDetail

    if (permitHolderType === undefined) {
      return this.redirect({ h, route: PERMIT_HOLDER_TYPE })
    }

    // If there is a charity detail, it must be a charity
    switch (charityPermitHolder ? CHARITY_OR_TRUST.type : permitHolderType.type) {
      case undefined:
        return this.redirect({ h, route: PERMIT_HOLDER_TYPE })
      case INDIVIDUAL.type:
      case SOLE_TRADER.type:
        // Re-direct to individual details flow
        return this.redirect({ h, route: PERMIT_HOLDER_NAME_AND_DATE_OF_BIRTH })
      case LIMITED_LIABILITY_PARTNERSHIP.type:
        // Re-direct to limited liability partnership details flow
        return this.redirect({ h, route: LLP_COMPANY_NUMBER })
      case PUBLIC_BODY.type:
        // Re-direct to partnership details flow
        return this.redirect({ h, route: PUBLIC_BODY_NAME })
      case PARTNERSHIP.type:
        // Re-direct to partnership details flow
        return this.redirect({ h, route: PARTNERSHIP_TRADING_NAME })
      case CHARITY_OR_TRUST.type:
        // Re-direct to partnership details flow
        return this.redirect({ h, route: CHARITY_PERMIT_HOLDER })
      case OTHER_ORGANISATION.type:
        // Re-direct to partnership details flow
        return this.redirect({ h, route: PERMIT_GROUP_DECIDE })
      default:
        // Re-direct to company details flow
        return this.redirect({ h, route: COMPANY_NUMBER })
    }
  }
}
