'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const CookieService = require('../../../services/cookie.service')
const Address = require('../../../models/address.model')
const SiteNameAndLocation = require('../../../models/taskList/siteNameAndLocation.model')

module.exports = class AddressSelectSiteController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors)
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    let postcode = CookieService.get(request, Constants.CookieValue.SITE_POSTCODE)
    if (postcode) {
      postcode = postcode.toUpperCase()
    }

    const [addresses, address] = await Promise.all([
      Address.listByPostcode(authToken, postcode),
      SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
    ])

    if (!errors && address && addresses) {
      // Set a flag on the selected address
      const selectedAddress = addresses.filter((element) => element.uprn === address.uprn).pop()
      if (selectedAddress) {
        selectedAddress.selected = true
      }
    }

    pageContext.formValues = {
      postcode: postcode,
      address: address,
      addresses: addresses
    }

    pageContext.changePostcodeLink = Constants.Routes.ADDRESS.POSTCODE_SITE.path
    pageContext.manualAddressLink = Constants.Routes.ADDRESS.MANUAL_SITE.path

    return reply.view('address/selectAddress', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      const addressDto = {
        uprn: request.payload['select-address'],
        postcode: CookieService.get(request, Constants.CookieValue.SITE_POSTCODE)
      }
      await SiteNameAndLocation.saveSelectedAddress(request, authToken, applicationId, applicationLineId, addressDto)

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
