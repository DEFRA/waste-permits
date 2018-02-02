'use strict'

const Constants = require('../../../constants')
const BaseController = require('../../base.controller')
const AddressManualValidator = require('../../../validators/address/addressManual.validator')
const CookieService = require('../../../services/cookie.service')
const InvoiceAddress = require('../../../models/taskList/invoiceAddress.model')

module.exports = class AddressManualInvoiceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new AddressManualValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await InvoiceAddress.getAddress(request, authToken, applicationId)
      if (address) {
        pageContext.formValues = {
          'building-name-or-number': address.buildingNameOrNumber,
          'address-line-1': address.addressLine1,
          'address-line-2': address.addressLine2,
          'town-or-city': address.townOrCity,
          postcode: address.postcode
        }
      }
    }

    return reply.view('address/manualEntry', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      const addressDto = {
        buildingNameOrNumber: request.payload['building-name-or-number'],
        addressLine1: request.payload['address-line-1'],
        addressLine2: request.payload['address-line-2'],
        townOrCity: request.payload['town-or-city'],
        postcode: request.payload['postcode']
      }

      await InvoiceAddress.saveManualAddress(request, authToken, applicationId, applicationLineId, addressDto)

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
