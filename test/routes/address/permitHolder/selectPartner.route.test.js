const Lab = require('lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')

const contactDetailId = 'CONTACT_DETAIL_ID'

selectAddressTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/partners/address/select-address/${contactDetailId}`,
  nextRoutePath: '/permit-holder/partners/list',
  contactDetailId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.task'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
