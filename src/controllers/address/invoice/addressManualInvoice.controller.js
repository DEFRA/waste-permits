'use strict'

const Constants = require('../../../constants')
const AddressManualController = require('../base/addressManual.controller')
const InvoiceAddress = require('../../../models/taskList/invoiceAddress.task')

module.exports = class AddressManualInvoiceController extends AddressManualController {
  getPostcodeCookieKey () {
    return Constants.CookieValue.INVOICE_POSTCODE
  }

  get task () {
    return InvoiceAddress
  }
}
