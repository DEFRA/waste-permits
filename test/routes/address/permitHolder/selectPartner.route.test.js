const Lab = require('lab')
const lab = exports.lab = Lab.script()
const selectAddressTests = require('../selectAddressTests')

const applicationContactId = 'APPLICATION_CONTACT_ID'

selectAddressTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/partners/address/select-address/${applicationContactId}`,
  nextRoutePath: '/permit-holder/partners/list',
  applicationContactId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.task'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
