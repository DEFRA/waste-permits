'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

const contactDetailId = 'CONTACT_DETAIL_ID'

manualAddressTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/group/post-holder/address/address-manual/${contactDetailId}`,
  nextRoutePath: '/permit-holder/group/list',
  contactDetailId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.task'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
