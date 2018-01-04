'use strict'

const Constants = require('../constants')
const Route = require('./baseRoute')
const InvoicingDetailsController = require('../controllers/invoicingDetails.controller')
const controller = new InvoicingDetailsController(Constants.Routes.INVOICING_DETAILS)

module.exports = Route.register('GET', controller, true)
