const Lab = require('lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')
const { PERMIT_HOLDER_TYPES: { CHARITY_OR_TRUST } } = require('../../../../src/dynamics')

selectAddressTests(lab, {
  permitHolderType: CHARITY_OR_TRUST,
  pageHeading: 'What is their address?',
  routePath: '/permit-holder/address/select-address',
  nextRoutePath: '/permit-holder/company/declare-offences',
  TaskModel: require('../../../../src/models/taskList/permitHolderDetails.task'),
  PostCodeCookie: 'PERMIT_HOLDER_POSTCODE'
})
