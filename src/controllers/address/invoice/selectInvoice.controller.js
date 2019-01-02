'use strict'

const Constants = require('../../../constants')
const Routes = require('../../../routes')
const AddressSelectController = require('../base/addressSelect.controller')
const InvoiceAddress = require('../../../models/taskList/invoiceAddress.task')

module.exports = class AddressSelectInvoiceController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.INVOICE_POSTCODE
  }

  getManualEntryPath () {
    return Routes.MANUAL_INVOICE.path
  }

  getPostcodePath () {
    return Routes.POSTCODE_INVOICE.path
  }

  getModel () {
    return InvoiceAddress
  }
}
