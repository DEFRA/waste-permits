'use strict'
'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const CookieService = require('../../../src/services/cookie.service')
const RecoveryService = require('../../../src/services/recovery.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/errors/order/done-cant-go-back'
const pageHeading = 'You have sent your application so you cannot go back and change it'

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => mocks.recovery)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Already Submitted page tests:', () => {
  let getRequest

  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  lab.beforeEach(() => {
    getRequest = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }
  })

  lab.test('The page should NOT have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    const element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the Already Submitted page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'paragraph-1',
      'paragraph-2',
      'paragraph-3',
      'psc-email-link',
      'mcpd-help-email-link',
      'application-reference',
      'start-new-application-link'
    ])

    // Ensure that the application reference is being displayed correctly
    element = doc.getElementById('application-reference')
    Code.expect(element.textContent).to.equal(mocks.application.applicationNumber)
  })
})
