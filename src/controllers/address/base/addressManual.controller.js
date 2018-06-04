'use strict'

const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const RecoveryService = require('../../../services/recovery.service')

module.exports = class AddressManualController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(errors)
    const {applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await this.getModel().getAddress(request, applicationId, applicationLineId)
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

    return this.showView({request, h, pageContext})
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const {applicationId, applicationLineId} = await RecoveryService.createApplicationContext(h)

      const addressDto = {
        buildingNameOrNumber: request.payload['building-name-or-number'],
        addressLine1: request.payload['address-line-1'],
        addressLine2: request.payload['address-line-2'],
        townOrCity: request.payload['town-or-city'],
        postcode: request.payload['postcode']
      }

      await this.getModel().saveManualAddress(request, applicationId, applicationLineId, addressDto)

      return this.redirect({request, h, redirectPath: this.getNextRoute()})
    }
  }
}
