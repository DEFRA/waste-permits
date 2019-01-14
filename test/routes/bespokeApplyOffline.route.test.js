'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const Mocks = require('../helpers/mocks')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/persistence/entities/application.entity')
const StandardRule = require('../../src/persistence/entities/standardRule.entity')
const CookieService = require('../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../src/constants')

const routePath = '/bespoke-apply-offline'

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
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(Application.prototype, 'save').value(() => undefined)
  sandbox.stub(StandardRule, 'getByApplicationLineId').value(() => mocks.application)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Bespoke Apply Offline page tests:', () => {
  lab.test(`GET ${routePath} returns the bespoke apply offline page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for a bespoke permit')

    Code.expect(doc.getElementById('bespoke-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/waste-environmental-permits#how-to-apply-for-a-bespoke-permit')
  })
})
