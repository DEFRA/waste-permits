'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('./generalTestHelper.test')

const server = require('../../server')
const Application = require('../../src/models/application.model')
const ApplicationLine = require('../../src/models/applicationLine.model')
const CookieService = require('../../src/services/cookie.service')
const LoggingService = require('../../src/services/logging.service')
const {COOKIE_RESULT} = require('../../src/constants')

const PaymentTypes = {
  CARD_PAYMENT: 910400000,
  BACS_PAYMENT: 910400005
}

let sandbox

const routePath = '/pay/type'
const errorPath = '/errors/technical-problem'
const notSubmittedRoutePath = '/errors/order/check-answers-not-complete'

const fakeApplication = {
  id: 'APPLICATION_ID'
}

const fakeApplicationLine = {
  id: 'APPLICATION_LINE_ID'
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
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`How do you want to pay?:`, () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeAlreadySubmittedTest: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    lab.beforeEach(() => {})

    lab.experiment('success', () => {
      lab.test('static content exists', async () => {
        const doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('How do you want to pay?')
        Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

        // Test for the existence of expected static content
        GeneralTestHelper.checkElementsExist(doc, [
          'card-payment-label',
          'card-payment-label-hint',
          'bacs-payment-label',
          'bacs-payment-label-abbr',
          'bacs-payment-label-hint'
        ])
        // payment cost should default to 0
        Code.expect(doc.getElementById('payment-cost').firstChild.nodeValue).to.equal('0')
      })

      lab.test('value is formated correctly including pence', async () => {
        const testApplicationLine = Object.assign({}, fakeApplicationLine, {value: 10000.25})
        ApplicationLine.getById = () => new ApplicationLine(testApplicationLine)
        const doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('payment-cost').firstChild.nodeValue).to.equal('10,000.25')
      })

      lab.test('value is formated without pence', async () => {
        const testApplicationLine = Object.assign({}, fakeApplicationLine, {value: 1000})
        ApplicationLine.getById = () => new ApplicationLine(testApplicationLine)
        const doc = await GeneralTestHelper.getDoc(getRequest)

        Code.expect(doc.getElementById('payment-cost').firstChild.nodeValue).to.equal('1,000')
      })
    })

    lab.experiment('failure', () => {
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

  lab.experiment(`POST ${routePath}`, () => {
    let postRequest

    lab.beforeEach(() => {
      postRequest = {
        method: 'POST',
        url: routePath,
        headers: {},
        payload: {
          'payment-type': PaymentTypes.BACS_PAYMENT
        }
      }
    })

    lab.experiment('success', () => {
      lab.test('when payment is selected as bacs', async () => {
        postRequest.payload = {'payment-type': PaymentTypes.BACS_PAYMENT}
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/pay/bacs')
      })

      lab.test('when payment is selected as card', async () => {
        postRequest.payload = {'payment-type': PaymentTypes.CARD_PAYMENT}
        const res = await server.inject(postRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal('/pay/card')
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when payment is not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        GeneralTestHelper.checkValidationMessage(doc, 'payment-type', 'Select how you want to pay')
      })

      lab.test('redirects to error screen when an unexpected payment type is selected', async () => {
        const spy = sinon.spy(LoggingService, 'logError')
        postRequest.payload['payment-type'] = '99999999'

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })

      lab.test('Redirects to the Not Submitted screen if the application has not been submitted', async () => {
        sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(notSubmittedRoutePath)
      })
    })
  })
})
