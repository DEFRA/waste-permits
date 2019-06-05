'use strict'
'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Mocks = require('../../helpers/mocks')
const GeneralTestHelper = require('../generalTestHelper.test')

const Application = require('../../../src/persistence/entities/application.entity')
const CookieService = require('../../../src/services/cookie.service')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/errors/recovery-failed'
const pageHeading = `Sorry, we cannot find that application`

let sandbox
let mocks

lab.beforeEach(() => {
  mocks = new Mocks()

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application, 'getById').value(() => mocks.application)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Recovery failed page tests:', () => {
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

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the Recovery failed page correctly`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'things-to-try-heading',
      'things-to-try-paragraph',
      'permiting-and-support-centre',
      'support-email-link',
      'support-telephone',
      'support-telephone-link',
      'when-open'
    ])

    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal(pageHeading)
  })
})
