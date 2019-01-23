const Lab = require('lab')
const lab = exports.lab = Lab.script()
const postcodeTests = require('../postcodeTests')

const contactDetailId = 'CONTACT_DETAIL_ID'

postcodeTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/group/post-holder/address/postcode/${contactDetailId}`,
  nextRoutePath: `/permit-holder/group/post-holder/address/select-address/${contactDetailId}`,
  nextRoutePathManual: `/permit-holder/group/post-holder/address/address-manual/${contactDetailId}`,
  contactDetailId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.task'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
