'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

const routePath = '/information/privacy'

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Privacy page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(true, true, true)

  lab.test(`GET ${routePath} success`, async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'personal-information-charter-paragraph-1',
      'personal-information-charter-paragraph-2',
      'personal-information-charter-paragraph-3',
      'personal-information-charter-link',
      'public-register-information',
      'public-register-information-item-1',
      'public-register-information-item-2',
      'public-register-information-item-3',
      'personal-information',
      'personal-information-item-1',
      'personal-information-item-2',
      'personal-information-item-3',
      'personal-information-item-4',
      'personal-information-item-5',
      'personal-information-item-6',
      'sharing-information'
    ])

    Code.expect(doc.getElementById('personal-information-charter-link').getAttribute('href')).to.equal('https://www.gov.uk/government/organisations/environment-agency/about/personal-information-charter')
  })
})
