const Lab = require('lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')

selectAddressTests(lab, {
  pageHeading: 'What is the site address?',
  routePath: '/site/address/select-address',
  nextRoutePath: '/task-list',
  TaskModel: require('../../../../src/models/taskList/siteNameAndLocation.model'),
  PostCodeCookie: 'SITE_POSTCODE'
})
