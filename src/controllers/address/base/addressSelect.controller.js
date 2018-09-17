'use strict'

const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const RecoveryService = require('../../../services/recovery.service')
const Address = require('../../../models/address.model')

module.exports = class AddressSelectController extends BaseController {
  async doGet (request, h, errors) {
    const pageContext = this.createPageContext(request, errors)
    const context = await RecoveryService.createApplicationContext(h)
    const { applicationId, applicationLineId } = context
    let addresses, address
    let postcode = CookieService.get(request, this.getPostcodeCookieKey())
    if (postcode) {
      postcode = postcode.toUpperCase()

      addresses = await Address.listByPostcode(context, postcode)
      address = await this.getModel().getAddress(request, applicationId, applicationLineId)

      if (!errors && address && addresses) {
        // Set a flag on the selected address
        const selectedAddress = addresses.filter((element) => element.uprn === address.uprn).pop()
        if (selectedAddress) {
          selectedAddress.selected = true
        }
      }
    }

    // Handle missing values in case the user accesses this route without having been to the Enter Postcode route beforehand
    if (!postcode) {
      postcode = 'Not entered'
    }
    if (!addresses) {
      addresses = []
    }

    pageContext.formValues = {
      postcode: postcode,
      address: address,
      addresses: addresses
    }

    if (this.customisePageContext) {
      await this.customisePageContext(pageContext, request)
    }

    pageContext.changePostcodeLink = this.getPostcodeRoute(request.params)
    pageContext.manualAddressLink = this.getManualEntryRoute(request.params)

    return this.showView({ request, h, pageContext })
  }

  async doPost (request, h, errors) {
    if (errors && errors.details) {
      return this.doGet(request, h, errors)
    } else {
      const context = await RecoveryService.createApplicationContext(h)
      const { applicationId, applicationLineId } = context

      const addressDto = {
        uprn: request.payload['select-address'],
        postcode: CookieService.get(request, this.getPostcodeCookieKey())
      }
      await this.getModel().saveSelectedAddress(request, applicationId, applicationLineId, addressDto)

      return this.redirect({ request, h, redirectPath: this.nextPath })
    }
  }
}
