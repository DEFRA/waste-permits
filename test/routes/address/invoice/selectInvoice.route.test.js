const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')

selectAddressTests(lab, {
  pageHeading: 'Where should we send invoices for the annual costs after the permit has been issued?',
  routePath: '/invoice/address/select-address',
  nextRoutePath: '/invoice/contact',
  TaskModel: require('../../../../src/models/taskList/invoiceAddress.task'),
  PostCodeCookie: 'INVOICE_POSTCODE'
})
