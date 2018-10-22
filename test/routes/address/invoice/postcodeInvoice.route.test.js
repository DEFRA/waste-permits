const Lab = require('lab')
const lab = exports.lab = Lab.script()
const postcodeTests = require('../postcodeTests')

postcodeTests(lab, {
  pageHeading: 'Where should we send invoices for the annual costs after the permit has been issued?',
  routePath: '/invoice/address/postcode',
  nextRoutePath: '/invoice/address/select-address',
  nextRoutePathManual: '/invoice/address/address-manual',
  TaskModel: require('../../../../src/models/taskList/invoiceAddress.task'),
  PostCodeCookie: 'INVOICE_POSTCODE'
})
