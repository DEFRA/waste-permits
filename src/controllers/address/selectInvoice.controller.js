'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const AddressSelectValidator = require('../../validators/address/addressSelect.validator')
// const AddressLookupService = require('../../services/addressLookup.service')
// const CookieService = require('../../services/cookie.service')
// const Address = require('../../models/address.model')
// const SiteNameAndLocation = require('../../models/taskList/siteNameAndLocation.model')

module.exports = class AddressSelectInvoiceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new AddressSelectValidator())
    // const authToken = CookieService.getAuthToken(request)
    // const applicationId = CookieService.getApplicationId(request)
    // const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // TODO confirm if we need this
      // If we have Address details in the payload then display them in the form
      // pageContext.formValues = request.payload
    } else {
      // TODO reinstate this
      // const address = await SiteNameAndLocation.getAddress(request, authToken, applicationId, applicationLineId)
      // if (address) {
    }

    // TODO get from application
    const postcode = 'BS1 5AH'

    pageContext.formValues = {
      postcode: postcode,
      // addresses: Address.listByPostcode(authToken, postcode)

      // TODO remove this
      // postcode: address.postcode,
      addresses: []
      // addresses: await AddressLookupService.getAddressesFromPostcode(address.postcode)}
    }

    pageContext.changePostcodeLink = Constants.Routes.ADDRESS.POSTCODE_INVOICE.path
    pageContext.manualAddressLink = Constants.Routes.ADDRESS.MANUAL_INVOICE.path

    return reply.view('address/selectAddress', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      // TODO Save the selected address

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
