'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')
const CookieService = require('../../src/services/cookie.service')

let validateCookieStub

const routePath = '/save-and-return/check-your-email'

lab.beforeEach((done) => {
  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => {
    return true
  }
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
})

lab.experiment(`Search for 'standard rules permit application' in your email page tests:`, () => {
  lab.test('The page should have a back link', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      const element = doc.getElementById('back-link')
      Code.expect(element).to.exist()
    })
  })

  lab.test('GET /save-and-return/check-your-email success ', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)
    })
  })
})
