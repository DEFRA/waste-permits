'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const AddressSelectValidator = require('../../validators/address/addressSelect.validator')
const CookieService = require('../../services/cookie.service')
const Address = require('../../models/address.model')
const InvoiceAddress = require('../../models/taskList/InvoiceAddress.model')

module.exports = class AddressSelectInvoiceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new AddressSelectValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    const postcode = CookieService.get(request, Constants.CookieValue.INVOICE_POSTCODE)

    const [addresses, address] = await Promise.all([
      Address.listByPostcode(authToken, postcode),
      InvoiceAddress.getAddress(request, authToken, applicationId)
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

    pageContext.changePostcodeLink = Constants.Routes.ADDRESS.POSTCODE_INVOICE.path
    pageContext.manualAddressLink = Constants.Routes.ADDRESS.MANUAL_INVOICE.path

    return reply.view('address/selectAddress', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)
      const postcode = CookieService.get(request, Constants.CookieValue.INVOICE_POSTCODE)

      // Get the UPRN for the selected selected address
      const uprn = request.payload['select-address']

      await InvoiceAddress.saveSelectedAddress(request, authToken, applicationId, applicationLineId,
        Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE, postcode, uprn)

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
