'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const server = require('../../server')

const DOMParser = require('xmldom').DOMParser
const Application = require('../../src/models/application.model')
const CookieService = require('../../src/services/cookie.service')

let generateCookieStub
let validateCookieStub
let applicationSaveStub

const routePath = '/start/start-or-open-saved'

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

lab.beforeEach(() => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = (reply) => {
    return fakeCookie
  }
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (request) => {
    return true
  }

  applicationSaveStub = Application.prototype.save
  Application.prototype.save = (authToken) => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.generateCookie = generateCookieStub
  CookieService.validateCookie = validateCookieStub
  Application.prototype.save = applicationSaveStub
})

lab.experiment('Start or Open Saved page tests:', () => {
  lab.test('The page should NOT have a back link', async () => {
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

    let element = doc.getElementById('back-link')
    Code.expect(element).to.not.exist()
  })

  lab.test('GET returns the Start or Open Saved page correctly', async () => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element = doc.getElementById('page-heading').firstChild
    Code.expect(element.nodeValue).to.equal('Apply for a standard rules waste permit')

    element = doc.getElementById('start-application')
    Code.expect(element).to.exist()

    element = doc.getElementById('open-application')
    Code.expect(element).to.exist()

    element = doc.getElementById('submit-button').firstChild
    Code.expect(element.nodeValue).to.equal('Continue')
  })

  lab.test('POST on Start or Open Saved page for a new application redirects to the correct route', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'started-application': 'new'
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/permit/category')
  })

  lab.test('POST on Start or Open Saved page to open an existing application redirects to the correct route', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'started-application': 'open'
      }
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(302)
    Code.expect(res.headers['location']).to.equal('/save-and-return/check-your-email')
  })

  lab.test('POST Start or Open Saved page shows the error message summary panel when new or open has not been selected', async () => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    const res = await server.inject(request)
    Code.expect(res.statusCode).to.equal(200)

    const parser = new DOMParser()
    const doc = parser.parseFromString(res.payload, 'text/html')

    let element
    let errorMessage = 'Select start new or open a saved application'

    // Panel summary error item
    element = doc.getElementById('error-summary-list-item-0').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)

    // Site name field error
    element = doc.getElementById('started-application-error').firstChild
    Code.expect(element.nodeValue).to.equal(errorMessage)
  })
})
