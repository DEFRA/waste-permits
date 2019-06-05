'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

manualAddressTests(lab, {
  pageHeading: 'What is the main address for the local authority or public body?',
  routePath: '/permit-holder/public-body/address/address-manual',
  nextRoutePath: '/permit-holder/public-body/officer',
  TaskModel: require('../../../../src/models/taskList/publicBodyDetails.task'),
  PostCodeCookie: 'PUBLIC_BODY_POSTCODE'
})
