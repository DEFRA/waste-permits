'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const CookieService = require('../../../src/services/cookie.service')
const Application = require('../../../src/persistence/entities/application.entity')
const PageNotFoundController = require('../../../src/controllers/error/pageNotFound.controller')
const { COOKIE_RESULT } = require('../../../src/constants')

const routePath = '/errors/page-not-found'
const pageHeading = `We cannot find that page`

let getRequest
let sandbox

lab.beforeEach(() => {
  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {},
    payload: {}
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)
  sandbox.stub(PageNotFoundController, 'hasApplication').value(() => false)
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment('Page Not Found (404) page tests:', () => {
  new GeneralTestHelper({ lab, routePath }).test({
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  lab.test('The page should NOT have a back link', async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest, 404)

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the 404 page correctly when there is no application`, async () => {
    const doc = await GeneralTestHelper.getDoc(getRequest, 404)

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'page-not-found-paragraph',
      'apply-link'
    ])
  })

  lab.test(`GET ${routePath} returns the 404 page correctly when there is an application`, async () => {
    sandbox.stub(PageNotFoundController, 'hasApplication').value(() => true)

    const doc = await GeneralTestHelper.getDoc(getRequest, 404)

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    // Test for the existence of expected static content
    GeneralTestHelper.checkElementsExist(doc, [
      'page-not-found-paragraph',
      'task-list-link'
    ])
  })

  lab.test('GET /an-invalid-route shows the 404 page when the user has a valid cookie', async () => {
    getRequest.url = '/an-invalid-route'
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(routePath)
  })
})
