'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')

module.exports = class AddressManualController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await this.getModel().getAddress(request, authToken, applicationId, applicationLineId)
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

    return this.showView(request, reply, 'address/manualEntry', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

      const addressDto = {
        buildingNameOrNumber: request.payload['building-name-or-number'],
        addressLine1: request.payload['address-line-1'],
        addressLine2: request.payload['address-line-2'],
        townOrCity: request.payload['town-or-city'],
        postcode: request.payload['postcode']
      }

      await this.getModel().saveManualAddress(request, authToken, applicationId, applicationLineId, addressDto)

      return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
    }
  }
}
