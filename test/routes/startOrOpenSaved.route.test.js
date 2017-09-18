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

let routePath = '/start/start-or-open-saved'

const fakeCookie = {
  applicationId: 'my_application_id',
  authToken: 'my_auth_token'
}

lab.beforeEach((done) => {
  // Stub methods
  generateCookieStub = CookieService.generateCookie
  CookieService.generateCookie = (reply) => {
    return fakeCookie
  }
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = (cookie) => {
    return true
  }

  applicationSaveStub = Application.prototype.save
  Application.prototype.save = (authToken) => {}
  done()
})

lab.afterEach((done) => {
  // Restore stubbed methods
  CookieService.generateCookie = generateCookieStub
  CookieService.validateCookie = validateCookieStub
  Application.prototype.save = applicationSaveStub

  done()
})

lab.experiment('Start or Open Saved page tests:', () => {
  lab.test('GET returns the Start or Open Saved page correctly', (done) => {
    const request = {
      method: 'GET',
      url: routePath,
      headers: {}
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      let element = doc.getElementById('start-or-open-saved-heading').firstChild
      Code.expect(element.nodeValue).to.equal('Apply for a standard rules waste permit')

      element = doc.getElementById('start-application')
      Code.expect(element).to.exist()

      element = doc.getElementById('open-application')
      Code.expect(element).to.exist()

      element = doc.getElementById('start-or-open-saved-submit').firstChild
      Code.expect(element.nodeValue).to.equal('Continue')

      done()
    })
  })

  lab.test('POST on Start or Open Saved page for a new application redirects to the correct route', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'started-application': 'new'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/permit/category')

      done()
    })
  })

  lab.test('POST on Start or Open Saved page to open an existing application redirects to the correct route', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {
        'started-application': 'open'
      }
    }

    server.inject(request, (res) => {
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/save-and-return/check-your-email')

      done()
    })
  })

  lab.test('POST Start or Open Saved page shows the error message summary panel when new or open has not been selected', (done) => {
    const request = {
      method: 'POST',
      url: routePath,
      headers: {},
      payload: {}
    }

    server.inject(request, (res) => {
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

      done()
    })
  })
})
