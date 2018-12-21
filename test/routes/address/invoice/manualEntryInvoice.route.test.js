'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

manualAddressTests(lab, {
  pageHeading: 'Where should we send invoices for the annual costs after the permit has been issued?',
  routePath: '/invoice/address/address-manual',
  nextRoutePath: '/invoice/contact',
  TaskModel: require('../../../../src/models/taskList/invoiceAddress.task'),
  PostCodeCookie: 'INVOICE_POSTCODE'
})
