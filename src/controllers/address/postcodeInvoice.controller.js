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

    if (request.payload) {
      // If we have Address details in the payload then display them in the form
      pageContext.formValues = request.payload
    } else {
      const address = await InvoiceAddress.getAddress(request, authToken, applicationId)
      if (address) {
        // If the manual entry flag is set then redirect off to the mamual address entry page instead
        if (!address.fromAddressLookup) {
          return reply.redirect(Constants.Routes.ADDRESS.MANUAL_INVOICE.path)
        }
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
      const postcode = request.payload['postcode']

      // Save the postcode in the cookie
      CookieService.set(request, Constants.CookieValue.INVOICE_POSTCODE, postcode)

      return reply.redirect(Constants.Routes.ADDRESS.SELECT_INVOICE.path)

        // Add the updated cookie
        .state(Constants.COOKIE_KEY, request.state[Constants.COOKIE_KEY], Constants.COOKIE_PATH)
    }
  }
}
