'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/models/application.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let fakeApplication

let validateCookieStub
let logErrorStub
let applicationGetByIdStub

let fakeApplicationId = 'APPLICATION_ID'

const routePath = '/done'

lab.beforeEach(() => {
  fakeApplication = {
    id: fakeApplicationId,
    applicationName: 'APPLICATION_NAME',
    paymentReceived: 1
  }

  // Stub methods
  validateCookieStub = CookieService.validateCookie
  CookieService.validateCookie = () => COOKIE_RESULT.VALID_COOKIE

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

lab.experiment('ApplicationReceived page tests:', () => {
  new GeneralTestHelper(lab, routePath).test(false, true, true)

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
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(fakeApplication.applicationName)
      Code.expect(doc.getElementById('application-received-info')).to.exist()
      Code.expect(doc.getElementById('application-received-hint')).to.exist()
      Code.expect(doc.getElementById('application-received-warning')).to.exist()
    })

    lab.test('Redirects to the Not Paid screen if the application has been paid for yet', async () => {
      fakeApplication.paymentReceived = 0

      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/errors/order/card-payment-not-complete')
    })
  })
})
