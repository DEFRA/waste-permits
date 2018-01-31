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
    // const applicationLineId = CookieService.getApplicationLineId(request)

    const postcode = CookieService.get(request, 'INVOICE_POSTCODE')

    // TODO await all
    const addresses = await Address.listByPostcode(authToken, postcode)
    const address = await InvoiceAddress.getAddress(request, authToken, applicationId)

    // Set a flag on the selected address
    if (address && addresses){
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

    if (request.payload) {
      // TODO confirm if we need this
      // If we have Address details in the payload then display them in the form
      // pageContext.formValues = request.payload
    } else {
      // const address = await InvoiceAddress.getAddress(request, authToken, applicationId)

      // if (address) {
      //   // Populate form with existing address
      //   pageContext.formValues = {
      //     postcode: postcode,
      //     addresses: await Address.listByPostcode(authToken, address.postcode)
      //   }
      // }
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
      const postcode = CookieService.get(request, 'INVOICE_POSTCODE')

      // Get the UPRN for the selected selected address
      const uprn = request.payload['select-address']

      if (!uprn) {
        const errorMessage =`Unable to save invoice address as it does not have a UPRN`
        LoggingService.logError(errorMessage, request)
        throw new Error(errorMessage)
      }

      // Get the AddressDetail for this Application (if there is one)
      let addressDetail = await AddressDetail.getByApplicationIdAndType(authToken, applicationId, Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE)
      if (!addressDetail) {
        // Create new AddressDetail
        addressDetail = new AddressDetail({
          type: Constants.Dynamics.AddressTypes.BILLING_INVOICING.TYPE,
          applicationId: applicationId

          // TODO - determine if we are going to link to a customer
          // customerId: customerId
        })
        await addressDetail.save(authToken)
      }

      let address = await Address.getByUprn(authToken, uprn)
      if (!address) {
        // The address is not already in Dynamics so look it up in AddressBase and save it in Dynamics
        let addresses = await Address.listByPostcode(authToken, postcode)
        addresses = addresses.filter((element) => element.uprn === uprn)
        address = addresses.pop()
        address.save(authToken)
      }

      // Save the AddressDetail to associate the Address with the Application
      if (address && addressDetail) {
        addressDetail.addressId = address.id
        await addressDetail.save(authToken)
      }

      // TODO remove the invoice postcode from the cookie

      return reply.redirect(Constants.Routes.TASK_LIST.path)
    }
  }
}
