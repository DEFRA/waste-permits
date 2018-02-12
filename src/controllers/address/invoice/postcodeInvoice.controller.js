'use strict'

const Constants = require('../../../constants')
const PostcodeController = require('../base/postcode.controller')
const InvoiceAddress = require('../../../models/taskList/invoiceAddress.model')

module.exports = class PostcodeInvoiceController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.INVOICE_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.ADDRESS.MANUAL_INVOICE.path
  }

  getAddressSelectionPath () {
    return Constants.Routes.ADDRESS.SELECT_INVOICE.path
  }

  getModel () {
    return InvoiceAddress
  }

  customisePageContext (pageContext) {
    pageContext.showInvoiceSubheading = true
  }
}
