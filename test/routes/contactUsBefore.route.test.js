'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/persistence/entities/application.entity')
const CookieService = require('../../src/services/cookie.service')
const RecoveryService = require('../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/existing-permit/yes'

let getRequest

let mocks
let sandbox

lab.beforeEach(() => {
  mocks = new Mocks()

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Contact us before applying page tests:', () => {
  lab.test(`GET ${routePath} returns the contact us before applying page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Contact us before you apply')
    Code.expect(doc.getElementById('vary-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/change-transfer-or-cancel-your-environmental-permit#change-vary-your-permit')
    Code.expect(doc.getElementById('contact-link').getAttribute('href')).to.equal('mailto:MCPDHELP@environment-agency.gov.uk')
  })
})
