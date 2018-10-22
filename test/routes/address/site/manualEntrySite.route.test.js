'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const manualAddressTests = require('../manualAddressTests')

manualAddressTests(lab, {
  pageHeading: 'Enter the site address',
  routePath: '/site/address/address-manual',
  nextRoutePath: '/task-list',
  TaskModel: require('../../../../src/models/taskList/siteNameAndLocation.task'),
  PostCodeCookie: 'SITE_POSTCODE'
})
