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

let fakeApplicationId = 'APPLICATION_ID'

const routePath = '/done'

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    name: 'APPLICATION_NAME'
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => true

  logErrorStub = LoggingService.logError
  LoggingService.logError = () => {}

  applicationGetByIdStub = Application.getById
  Application.getById = () => new Application(fakeApplication)
})

lab.afterEach(() => {
  // Restore stubbed methods
  CookieService.validateCookie = validateCookieStub
  LoggingService.logError = logErrorStub
  Application.getById = applicationGetByIdStub
})

lab.experiment('Contact details page tests:', () => {
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

    lab.test('The page should not have a back link', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('back-link')).to.not.exist()
    })

    lab.test('returns the application received page correctly', async () => {
      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Application received')
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(fakeApplication.name)
      Code.expect(doc.getElementById('application-received-info')).to.exist()
      Code.expect(doc.getElementById('application-received-hint')).to.exist()
      Code.expect(doc.getElementById('application-received-warning')).to.exist()
    })
  })
})
