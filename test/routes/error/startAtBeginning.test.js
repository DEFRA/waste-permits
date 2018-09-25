'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')

const GeneralTestHelper = require('../generalTestHelper.test')

const Application = require('../../../src/persistence/entities/application.entity')
const CookieService = require('../../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../../src/constants')

let sandbox

const routePath = '/errors/order/start-at-beginning'
const pageHeading = 'Please start at the beginning of the application'

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => new Application({}))
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Start at Beginning page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  lab.test('The page should NOT have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the Start at Beginning page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'apply-for-permit-link'
    ])
  })
})
