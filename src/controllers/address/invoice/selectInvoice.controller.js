'use strict'

const Constants = require('../../../constants')
const AddressSelectController = require('../base/addressSelect.controller')
const InvoiceAddress = require('../../../models/taskList/invoiceAddress.model')

module.exports = class AddressSelectInvoiceController extends AddressSelectController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.INVOICE_POSTCODE
  }

  getManualEntryRoute () {
    return Constants.Routes.MANUAL_INVOICE.path
  }

  getPostcodeRoute () {
    return Constants.Routes.POSTCODE_INVOICE.path
  }

  getModel () {
    return InvoiceAddress
  }
}
