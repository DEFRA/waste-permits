const Lab = require('lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')

selectAddressTests(lab, {
  pageHeading: 'What is their address?',
  routePath: '/permit-holder/address/select-address',
  nextRoutePath: '/permit-holder/company/declare-offences',
  TaskModel: require('../../../../src/models/taskList/permitHolderDetails.model'),
  PostCodeCookie: 'PERMIT_HOLDER_POSTCODE'
})
