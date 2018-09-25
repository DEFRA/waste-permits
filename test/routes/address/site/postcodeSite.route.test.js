const Lab = require('lab')
const lab = exports.lab = Lab.script()
const postcodeTests = require('../postcodeTests')

postcodeTests(lab, {
  pageHeading: 'What is the postcode for the site?',
  routePath: '/site/address/postcode',
  nextRoutePath: '/site/address/select-address',
  nextRoutePathManual: '/site/address/address-manual',
  TaskModel: require('../../../../src/models/taskList/siteNameAndLocation.task'),
  PostCodeCookie: 'SITE_POSTCODE'
})
