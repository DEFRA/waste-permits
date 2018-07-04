'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

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
  new GeneralTestHelper(lab, routePath).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true})

  lab.test(`GET ${routePath} success`, async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const doc = await GeneralTestHelper.getDoc(request)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'personal-information-heading-1',
      'personal-information-heading-2',
      'personal-information-heading-3',
      'personal-information-heading-4',
      'personal-information-charter-paragraph-1',
      'personal-information-charter-paragraph-2',
      'personal-information-charter-paragraph-4',
      'personal-information-charter-paragraph-5',
      'personal-information-charter-paragraph-6',
      'personal-information-charter-paragraph-7',
      'personal-information-charter-paragraph-8',
      'personal-information-charter-paragraph-9',
      'personal-information-charter-paragraph-10',
      'personal-information-charter-paragraph-11',
      'personal-information-charter-paragraph-12',
      'personal-information-charter-paragraph-13',
      'personal-information-charter-link',
      'personal-information',
      'personal-information-item-1',
      'personal-information-item-2',
      'personal-information-item-3',
      'personal-information-item-4',
      'personal-information-item-5'
    ])

    Code.expect(doc.getElementById('personal-information-charter-link').getAttribute('href')).to.equal('https://www.gov.uk/government/organisations/environment-agency/about/personal-information-charter')
    Code.expect(doc.getElementById('cookies-link').getAttribute('href')).to.equal('/information/cookies')
  })
})
