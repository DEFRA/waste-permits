'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const server = require('../../../server')
const CookieService = require('../../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../../src/constants')

let validateCookieStub
const routePath = '/page-not-found'

lab.beforeEach(() => {
  // Stub methods

  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
})

lab.experiment('Page Not Found (404) page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(404)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test('GET /page-not-found returns the 404 page correctly when the user has a valid cookie', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(404)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal(`We can't find that page`)

    element = doc.getElementById('page-not-found-paragraph').firstChild
    Code.expect(element).to.exist()

    element = doc.getElementById('page-not-found-task-list-link').firstChild
    Code.expect(element).to.exist()

    element = doc.getElementById('page-not-found-apply-link').firstChild
    Code.expect(element).to.exist()
  })

  lab.test('GET /page-not-found redirects to the start page when the user does not have a valid cookie', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    CookieService.validateCookie = () => {
      return false
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/start/start-or-open-saved')
  })

  lab.test('GET /an-invalid-route shows the 404 page when the user has a valid cookie', async () => {
    const request = {
      method: 'GET',
      url: '/an-invalid-route',
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal(routePath)
  })
})
