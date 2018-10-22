const Lab = require('lab')
const lab = exports.lab = Lab.script()
const postcodeTests = require('../postcodeTests')

postcodeTests(lab, {
  pageHeading: 'What is their address?',
  routePath: '/permit-holder/address/postcode',
  nextRoutePath: '/permit-holder/address/select-address',
  nextRoutePathManual: '/permit-holder/address/address-manual',
  TaskModel: require('../../../../src/models/taskList/permitHolderDetails.task'),
  PostCodeCookie: 'PERMIT_HOLDER_POSTCODE'
})
