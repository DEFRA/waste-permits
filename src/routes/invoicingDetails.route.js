'use strict'

const Constants = require('../constants')
const InvoicingDetailsController = require('../controllers/invoicingDetails.controller')
const controller = new InvoicingDetailsController(Constants.Routes.INVOICING_DETAILS)

module.exports = [{
  method: ['GET'],
  path: Constants.Routes.INVOICING_DETAILS.path,
  config: {
    description: 'The What address should we use to send invoices? page',
    handler: controller.handler,
    bind: controller,
    state: {
      parse: true,
      failAction: 'error'
    }
  }
}]
