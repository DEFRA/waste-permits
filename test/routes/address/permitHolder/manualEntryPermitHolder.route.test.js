'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')
const { PERMIT_HOLDER_TYPES: { CHARITY_OR_TRUST } } = require('../../../../src/dynamics')

manualAddressTests(lab, {
  permitHolderType: CHARITY_OR_TRUST,
  pageHeading: 'What is their address?',
  routePath: '/permit-holder/address/address-manual',
  nextRoutePath: '/permit-holder/company/declare-offences',
  TaskModel: require('../../../../src/models/taskList/permitHolderDetails.task'),
  PostCodeCookie: 'PERMIT_HOLDER_POSTCODE'
})
