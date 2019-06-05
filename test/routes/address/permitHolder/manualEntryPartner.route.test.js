'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

const contactDetailId = 'CONTACT_DETAIL_ID'

manualAddressTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/partners/address/address-manual/${contactDetailId}`,
  nextRoutePath: '/permit-holder/partners/list',
  contactDetailId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.task'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
