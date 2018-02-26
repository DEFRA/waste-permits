'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../../server')
const GeneralTestHelper = require('../generalTestHelper.test')

const CookieService = require('../../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../../src/constants')

let validateCookieStub
const routePath = '/errors/page-not-found'
const pageHeading = `We can't find that page`

let getRequest

lab.beforeEach(() => {
  // Stub methods

  getRequest = {
    method: 'GET',
    url: routePath,
    headers: {},
    payload: {}
  }

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
})

lab.experiment('Page Not Found (404) page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(false, true)

  lab.test('The page should NOT have a back link', async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(404)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test(`GET ${routePath} returns the 404 page correctly`, async () => {
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(404)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(pageHeading)

    const elementIds = [
      'page-not-found-paragraph'
      // 'task-list-link'
    ]
    for (let id of elementIds) {
      element = doc.getElementById(id)
      Code.expect(doc.getElementById(id)).to.exist()
    }
  })

  lab.test('GET /an-invalid-route shows the 404 page when the user has a valid cookie', async () => {
    getRequest.url = '/an-invalid-route'
    const res = await server.inject(getRequest)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(routePath)
  })
})
