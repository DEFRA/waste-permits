'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const PostcodeController = require('../base/postcode.controller')
const InvoiceAddress = require('../../../models/taskList/invoiceAddress.model')

module.exports = class PostcodeInvoiceController extends PostcodeController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.INVOICE_POSTCODE
  }

  getManualEntryRoute () {
    return Routes.MANUAL_INVOICE.path
  }

  getAddressSelectionPath () {
    return Routes.SELECT_INVOICE.path
  }

  getModel () {
    return InvoiceAddress
  }

  customisePageContext (pageContext) {
    pageContext.showInvoiceSubheading = true
  }
}
