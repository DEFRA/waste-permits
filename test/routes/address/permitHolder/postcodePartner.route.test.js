const Lab = require('lab')
const lab = exports.lab = Lab.script()
const postcodeTests = require('../postcodeTests')

const applicationContactId = 'APPLICATION_CONTACT_ID'

postcodeTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/partners/address/postcode/${applicationContactId}`,
  nextRoutePath: `/permit-holder/partners/address/select-address/${applicationContactId}`,
  nextRoutePathManual: `/permit-holder/partners/address/address-manual/${applicationContactId}`,
  applicationContactId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.model'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
