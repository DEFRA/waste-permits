'use strict'

const Constants = require('../../constants')
const BaseController = require('../base.controller')
const PostcodeValidator = require('../../validators/address/postcode.validator')
const CookieService = require('../../services/cookie.service')
const InvoiceAddress = require('../../models/taskList/invoiceAddress.model')

module.exports = class PostcodeInvoiceController extends BaseController {
  async doGet (request, reply, errors) {
    const pageContext = this.createPageContext(errors, new PostcodeValidator())
    const authToken = CookieService.getAuthToken(request)
    const applicationId = CookieService.getApplicationId(request)

    // TODO confirm if this is needed
    // const applicationLineId = CookieService.getApplicationLineId(request)

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await InvoiceAddress.getAddress(request, authToken, applicationId)
      if (address) {
        pageContext.formValues = {
          'postcode': address.postcode
        }
      }
    }

    pageContext.showInvoiceSubheading = true
    pageContext.manualAddressLink = Constants.Routes.ADDRESS.MANUAL_INVOICE.path
    pageContext.noPostcodeLink = `The invoice address doesn't have a postcode`

    return reply.view('address/postcode', pageContext)
  }

  async doPost (request, reply, errors) {
    if (errors && errors.data.details) {
      return this.doGet(request, reply, errors)
    } else {
      const authToken = CookieService.getAuthToken(request)
      const applicationId = CookieService.getApplicationId(request)
      const applicationLineId = CookieService.getApplicationLineId(request)

      const address = {
        postcode: request.payload['postcode']
      }
      await InvoiceAddress.saveAddress(request, address, authToken, applicationId, applicationLineId)

      return reply.redirect(Constants.Routes.ADDRESS.SELECT_INVOICE.path)
    }
  }
}
