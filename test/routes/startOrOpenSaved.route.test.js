'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const server = require('../../server')
const GeneralTestHelper = require('./generalTestHelper.test')

const Application = require('../../src/persistence/entities/application.entity')

const CookieService = require('../../src/services/cookie.service')

const { COOKIE_RESULT } = require('../../src/constants')

let sandbox

const Routes = require('../../src/routes')
const { START_OR_OPEN_SAVED, SEARCH_YOUR_EMAIL } = Routes

const routePath = START_OR_OPEN_SAVED.path
const nextRoutePath = Routes[START_OR_OPEN_SAVED.nextRoute].path
const checkEmailRoutePath = SEARCH_YOUR_EMAIL.path

let getRequest
let postRequest
let cookeServiceSet

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

lab.beforeEach(() => {
  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {}
  }
  postRequest = {
    method: 'POST',
    url: routePath,
    headers: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'generateCookie').value(() => fakeCookie)
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  cookeServiceSet = sandbox.stub(CookieService, 'set')
  cookeServiceSet.callsFake(async () => true)
  sandbox.stub(Application.prototype, 'save').value(async () => undefined)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Start or Open Saved page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  const checkCommonElements = async (doc) => {
    Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Apply for an environmental permit')
    Code.expect(doc.getElementById('privacy-link').getAttribute('href')).to.equal('https://www.gov.uk/guidance/environmental-permits-privacy-notice')
    Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')
    Code.expect(doc.getElementById('form').getAttribute('action')).to.equal(routePath)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'legend',
      'start-application',
      'start-application-label',
      'open-application',
      'open-application-label',
      'privacy-link-paragraph'
    ])
  }

  lab.experiment('General page tests:', () => {
    lab.test('The page should NOT have a back link', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      Code.expect(doc.getElementById('back-link')).to.not.exist()
    })
  })

  lab.experiment('GET:', () => {
    lab.test('GET returns the Start or Open Saved page correctly', async () => {
      const doc = await GeneralTestHelper.getDoc(getRequest)
      await checkCommonElements(doc)
    })
  })

  lab.experiment('POST:', () => {
    lab.test('POST on Start or Open Saved page for a new application redirects to the next route', async () => {
      postRequest.payload = {
        'started-application': 'new'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(nextRoutePath)
    })

    lab.test('POST on Start or Open Saved page to open an existing application redirects to the correct route', async () => {
      postRequest.payload = {
        'started-application': 'open'
      }
      const res = await server.inject(postRequest)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers.location).to.equal(checkEmailRoutePath)
    })

    lab.test('POST Start or Open Saved page shows the error message summary panel when new or open has not been selected', async () => {
      postRequest.payload = {}
      const doc = await GeneralTestHelper.getDoc(postRequest)
      await checkCommonElements(doc)
      await GeneralTestHelper.checkValidationMessage(doc, 'started-application', 'Select start new or open a saved application')
    })
  })
})
