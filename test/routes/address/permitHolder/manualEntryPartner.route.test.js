'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

const applicationContactId = 'APPLICATION_CONTACT_ID'

manualAddressTests(lab, {
  pageHeading: 'What is the address for',
  routePath: `/permit-holder/partners/address/address-manual/${applicationContactId}`,
  nextRoutePath: '/permit-holder/partners/list',
  applicationContactId,
  TaskModel: require('../../../../src/models/taskList/partnerDetails.model'),
  PostCodeCookie: 'PARTNER_POSTCODE'
})
