'use strict'

const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const RecoveryService = require('../../../services/recovery.service')

module.exports = class AddressManualController extends BaseController {
  async doGet (request, h, errors) {
    const { addressLookupFailed } = request.query || {}
    if (addressLookupFailed) {
      errors = this.setCustomError('custom.address.lookup.failed', 'building-name-or-number', { supressField: true })
    }
    const pageContext = this.createPageContext(h, errors)
    pageContext.errorSummaryTitle = addressLookupFailed ? 'Our address finder is not working' : ''

    const { charityDetail } = await RecoveryService.createApplicationContext(h)

    if (charityDetail && charityDetail.charityPermitHolder && this.route.pageHeadingCharity) {
      pageContext.pageHeading = this.route.pageHeadingCharity
    }

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await this.task.getAddress(request)
      if (address) {
        pageContext.formValues = {
          'building-name-or-number': address.buildingNameOrNumber,
          'address-line-1': address.addressLine1,
          'address-line-2': address.addressLine2,
          'town-or-city': address.townOrCity,
          postcode: address.postcode
        }
      } else {
        // Get the postcode out of the Cookie if there is one
        let postcode = CookieService.get(request, this.getPostcodeCookieKey())
        if (postcode) {
          postcode = postcode.toUpperCase()
        }
        pageContext.formValues = {
          postcode: postcode
        }
      }
    }

    if (this.customisePageContext) {
      await this.customisePageContext(pageContext, request)
    }

    return this.showView({ h, pageContext })
  }

  async doPost (request, h) {
    // Load entity context within the request object
    await RecoveryService.createApplicationContext(h)

    const addressDto = {
      buildingNameOrNumber: request.payload['building-name-or-number'],
      addressLine1: request.payload['address-line-1'],
      addressLine2: request.payload['address-line-2'],
      townOrCity: request.payload['town-or-city'],
      postcode: request.payload['postcode']
    }

    await this.task.saveManualAddress(request, addressDto)

    return this.redirect({ h })
  }
}
