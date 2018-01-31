'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser

const server = require('../../server')

const Application = require('../../src/models/application.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')

let fakeApplication

let validateCookieStub
let logErrorStub
let applicationGetByIdStub
let applicationSaveStub

let fakeApplicationId = 'APPLICATION_ID'

const routePath = '/check-before-sending'

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    declaration: true
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)

  applicationSaveStub = Application.prototype.save
  Application.prototype.save = () => {}
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  Application.getById = applicationGetByIdStub
  Application.save = applicationSaveStub
})

lab.experiment('Check your answers before sending your application page tests:', () => {
  lab.experiment(`GET ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.test('The page should have a back link', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('back-link')).to.exist()
    })

    lab.test('returns the check before sending page correctly', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Check your answers before sending your application')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Confirm and pay')
    })
  })

  lab.experiment(`POST ${routePath}`, () => {
    let request
    lab.beforeEach(() => {
      request = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('redirects to the Application Received route after an UPDATE', async () => {
        const res = await server.inject(request)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/done')
      })
    })
  })
})
