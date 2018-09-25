const Lab = require('lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')

selectAddressTests(lab, {
  pageHeading: 'What is the main address for the local authority or public body?',
  routePath: '/permit-holder/public-body/address/select-address',
  nextRoutePath: '/permit-holder/public-body/officer',
  TaskModel: require('../../../../src/models/taskList/publicBodyDetails.model'),
  PostCodeCookie: 'PUBLIC_BODY_POSTCODE'
})
