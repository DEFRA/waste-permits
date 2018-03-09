'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const Address = require('../../../models/address.model')

module.exports = class AddressSelectController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const {authToken, applicationId, applicationLineId, application} = await this.createApplicationContext(request, {application: true})

    if (application.isSubmitted()) {
      return this.redirect(request, reply, Constants.Routes.ERROR.ALREADY_SUBMITTED.path)
    }

    let addresses, address
    let postcode = CookieService.get(request, this.getPostcodeCookieKey())
    if (postcode) {
      postcode = postcode.toUpperCase()

      addresses = await Address.listByPostcode(authToken, postcode)
      address = await this.getModel().getAddress(request, authToken, applicationId, applicationLineId)

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

    pageContext.changePostcodeLink = this.getPostcodeRoute()
    pageContext.manualAddressLink = this.getManualEntryRoute()

    return this.showView(request, reply, 'address/selectAddress', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.details) {
      return this.doGet(request, reply, errors)
    } else {
      const {authToken, applicationId, applicationLineId} = await this.createApplicationContext(request)

      const addressDto = {
        uprn: request.payload['select-address'],
        postcode: CookieService.get(request, this.getPostcodeCookieKey())
      }
      await this.getModel().saveSelectedAddress(request, authToken, applicationId, applicationLineId, addressDto)

      return this.redirect(request, reply, Constants.Routes.TASK_LIST.path)
    }
  }
}
