'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/models/application.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const Payment = require('../../../src/models/payment.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../../src/constants')

const PaymentTypes = {
  CARD_PAYMENT: 910400000,
  BACS_PAYMENT: 910400005
}

let sandbox

const routePath = '/pay/card-problem'
const errorPath = '/errors/technical-problem'
const notSubmittedRoutePath = '/errors/order/check-answers-not-complete'

const fakeApplication = {
  id: 'APPLICATION_ID'
}

const fakeApplicationLine = {
  id: 'APPLICATION_LINE_ID'
}

const fakePayment = {
  id: '41536963-5041-e811-a95e-000d3a233e06',
  applicationLineId: 'APPLICATION_LINE_ID',
  category: 910400000,
  description: 'Application charge for a standard rules waste permit: Mobile plant for land-spreading SR2010 No 4',
  referenceNumber: 'P00001036-P1M',
  statusCode: 910400004,
  type: 910400000,
  value: 2641
}

const getRequest = {
  method: 'GET',
  url: routePath,
  headers: {},
  payload: {}
}

lab.beforeEach(() => {
  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => true)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationLine, 'getById').value(() => new Application(fakeApplicationLine))
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(LoggingService, 'logError').value(() => {})
  sandbox.stub(Payment, 'getCardPaymentDetails').value(() => new Payment(fakePayment))
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`Your card payment failed page:`, () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    lab.beforeEach(() => {})

    lab.experiment('success', () => {
      lab.test('static content exists', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Your card payment failed')
        Code.expect(doc.getElementById('submit-button')).to.not.exist()

        // Test for the existence of expected static content
        GeneralTestHelper.checkElementsExist(doc, [
          'no-money-taken',
          'app-not-sent',
          'retry-card-link',
          'bacs-payment-link',
          'try-again-later'
        ])
      })
    })

    lab.experiment('failure', () => {
      lab.test('Redirects to the Not Submitted screen if the application has not been submitted', async () => {
        sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(notSubmittedRoutePath)
      })

      lab.test('redirects to error screen when failing to get the application ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        Application.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('redirects to error screen when failing to get the applicationLine ID', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        ApplicationLine.getById = () => {
          throw new Error('read failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
