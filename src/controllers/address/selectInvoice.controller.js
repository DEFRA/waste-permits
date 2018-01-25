'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const AddressSelectValidator = require('../../validators/address/addressSelect.validator')
const CookieService = require('../../services/cookie.service')
const Address = require('../../models/address.model')
const AddressDetail = require('../../models/addressDetail.model')
const InvoiceAddress = require('../../models/taskList/InvoiceAddress.model')

module.exports = class AddressSelectInvoiceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new AddressSelectValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)
    const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // TODO confirm if we need this
      // If we have Address details in the payload then display them in the form
      // pageContext.formValues = request.payload
    } else {
      const address = await InvoiceAddress.getAddress(request, authToken, applicationId, applicationLineId)
      if (address) {
        pageContext.formValues = {
          postcode: address.postcode,
          addresses: await Address.listByPostcode(authToken, address.postcode)
        }
      }
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
      // TODO confirm if this is needed
      // const applicationLineId = CookieService.getApplicationLineId(request)

      // Save the selected address
      const uprn = request.payload['select-address']
      if (uprn) {
        const addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE)
        if (addressDetail) {
          const address = await Address.getById(authToken, addressDetail.addressId)
          if (address) {
            address.uprn = uprn
            address.fromAddressLookup = true
            await address.save()
          }
        }
      }

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
