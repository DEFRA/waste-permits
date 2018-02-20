'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let validateCookieStub

const routePath = '/save-and-return/check-your-email'

lab.beforeEach(() => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
})

lab.experiment(`Search for 'standard rules permit application' in your email page tests:`, () => {
  // TODO get these tests to work
  new GeneralTestHelper(lab, routePath).test(true, true)

  lab.test('The page should have a back link', async () => {
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

    const element = doc.getElementById('back-link')
    Code.expect(element).to.exist()
  })

  lab.test('GET /save-and-return/check-your-email success ', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)
  })
})
