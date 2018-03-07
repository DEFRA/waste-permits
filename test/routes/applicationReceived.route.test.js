'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const DOMParser = require('xmldom').DOMParser
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')

const Application = require('../../src/models/application.model')
const Payment = require('../../src/models/payment.model')
const LoggingService = require('../../src/services/logging.service')
const CookieService = require('../../src/services/cookie.service')
const {COOKIE_RESULT} = require('../../src/constants')

let sandbox

let fakeApplication

const routePath = '/done'

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID',
    applicationName: 'APPLICATION_NAME',
    paymentReceived: 1
  }

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(Payment, 'getByApplicationLineIdAndType').value(() => new Payment({}))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
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

    lab.test('returns the application received page correctly if bacs has been selected for payment eventhough the application has not been paid for yet', async () => {
      fakeApplication.paymentReceived = 0

      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Application received')
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(fakeApplication.applicationName)
      GeneralTestHelper.checkElementsExist(doc, [
        'reference-number-paragraph',
        'page-sub-heading',
        'application-received-info',
        'application-received-hint',
        'application-received-warning'
      ])
    })

    lab.test('returns the application received page correctly if bacs has not been selected for payment but the application has been paid for', async () => {
      Payment.getByApplicationLineIdAndType = () => undefined

      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(200)

      const parser = new DOMParser()
      const doc = parser.parseFromString(res.payload, 'text/html')

      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Application received')
      Code.expect(doc.getElementById('application-name').firstChild.nodeValue).to.equal(fakeApplication.applicationName)
      GeneralTestHelper.checkElementsExist(doc, [
        'reference-number-paragraph',
        'page-sub-heading',
        'application-received-info',
        'application-received-hint',
        'application-received-warning'
      ])
    })

    lab.test('Redirects to the Not Paid screen if bacs has not been selected for payment and the application has not been paid for yet', async () => {
      Payment.getByApplicationLineIdAndType = () => undefined
      fakeApplication.paymentReceived = 0

      const res = await server.inject(request)
      Code.expect(res.statusCode).to.equal(302)
      Code.expect(res.headers['location']).to.equal('/errors/order/card-payment-not-complete')
    })
  })
})
