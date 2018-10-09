'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

manualAddressTests(lab, {
  pageHeading: 'What is their address?',
  routePath: '/permit-holder/address/address-manual',
  nextRoutePath: '/permit-holder/company/declare-offences',
  TaskModel: require('../../../../src/models/taskList/permitHolderDetails.model'),
  PostCodeCookie: 'PERMIT_HOLDER_POSTCODE'
})
