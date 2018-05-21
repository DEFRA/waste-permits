'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const sinon = require('sinon')
const GeneralTestHelper = require('../generalTestHelper.test')

const server = require('../../../server')
const Application = require('../../../src/models/application.model')
const ApplicationLine = require('../../../src/models/applicationLine.model')
const ApplicationReturn = require('../../../src/models/applicationReturn.model')
const CookieService = require('../../../src/services/cookie.service')
const LoggingService = require('../../../src/services/logging.service')
const RecoveryService = require('../../../src/services/recovery.service')
const {COOKIE_RESULT} = require('../../../src/constants')

const PaymentTypes = {
  CARD_PAYMENT: 910400000,
  BACS_PAYMENT: 910400005
}

let sandbox

const fakeSlug = 'SLUG'

const routePath = `/pay/card-problem/${fakeSlug}`
const errorPath = '/errors/technical-problem'
const notSubmittedRoutePath = '/errors/order/check-answers-not-complete'

let fakeApplication
let fakeApplicationLine
let fakeApplicationReturn
let fakeRecovery

lab.beforeEach(() => {
  fakeApplication = {
    id: 'APPLICATION_ID'
  }

  fakeApplicationLine = {
    id: 'APPLICATION_LINE_ID'
  }

  fakeApplicationReturn = {
    applicationId: fakeApplication.id,
    slug: fakeSlug
  }

  fakeRecovery = () => ({
    authToken: 'AUTH_TOKEN',
    applicationId: fakeApplication.id,
    applicationLineId: fakeApplicationLine.id,
    application: new Application(fakeApplication),
    applicationLine: new ApplicationLine(fakeApplicationLine),
    applicationReturn: new ApplicationReturn(fakeApplicationReturn)
  })

  // Create a sinon sandbox to stub methods
  sandbox = sinon.createSandbox()

  // Stub methods
  sandbox.stub(Application.prototype, 'isSubmitted').value(() => true)
  sandbox.stub(Application, 'getById').value(() => new Application(fakeApplication))
  sandbox.stub(ApplicationLine, 'getById').value(() => new ApplicationLine(fakeApplicationLine))
  sandbox.stub(CookieService, 'validateCookie').value(() => COOKIE_RESULT.VALID_COOKIE)
  sandbox.stub(RecoveryService, 'createApplicationContext').value(() => fakeRecovery())
})

lab.afterEach(() => {
  // Restore the sandbox to make sure the stubs are removed correctly
  sandbox.restore()
})

lab.experiment(`Your card payment failed:`, () => {
  new GeneralTestHelper(lab, routePath).test({
    excludeCookieGetTests: true,
    excludeCookiePostTests: true,
    excludeAlreadySubmittedTest: true
  })

  lab.experiment(`GET ${routePath}`, () => {
    let getRequest

    const checkCommonElements = async (doc) => {
      Code.expect(doc.getElementById('page-heading').firstChild.nodeValue).to.equal('Your card payment failed')
      Code.expect(doc.getElementById('submit-button').firstChild.nodeValue).to.equal('Continue')

      // Test for the existence of expected static content
      GeneralTestHelper.checkElementsExist(doc, [
        'no-money-taken',
        'app-not-sent',
        'card-payment-label',
        'bacs-payment-label',
        'bacs-payment-label-abbr'
      ])
    }

    lab.beforeEach(() => {
      getRequest = {
        method: 'GET',
        url: routePath,
        headers: {},
        payload: {}
      }
    })

    lab.experiment('success', () => {
      lab.test('error content exists when status param is error', async () => {
        getRequest.url += '?status=error'
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('try-again-later')).to.exist()
      })

      lab.test('error content does not exist when status param is failure', async () => {
        getRequest.url += '?status=failure'
        const doc = await GeneralTestHelper.getDoc(getRequest)
        checkCommonElements(doc)
        Code.expect(doc.getElementById('try-again-later')).to.not.exist()
      })
    })

    lab.experiment('failure', () => {
      lab.test('redirects to error screen when failing to get the applicationContext', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        RecoveryService.createApplicationContext = () => {
          throw new Error('recovery failed')
        }

        const res = await server.inject(getRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })

    lab.experiment('invalid', () => {
      lab.test('redirects to the Not Submitted screen if the application has not been submitted', async () => {
        sandbox.stub(Application.prototype, 'isSubmitted').value(() => false)

        const res = await server.inject(getRequest)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(notSubmittedRoutePath)
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
        Code.expect(res.headers['location']).to.startWith('/pay/card')
      })
    })

    lab.experiment('invalid', () => {
      lab.test('when payment is not selected', async () => {
        postRequest.payload = {}
        const doc = await GeneralTestHelper.getDoc(postRequest)
        GeneralTestHelper.checkValidationMessage(doc, 'payment-type', 'Select how you want to pay')
      })

      lab.test('redirects to error screen when an unexpected payment type is selected', async () => {
        const spy = sandbox.spy(LoggingService, 'logError')
        postRequest.payload['payment-type'] = '99999999'

        const res = await server.inject(postRequest)
        Code.expect(spy.callCount).to.equal(1)
        Code.expect(res.statusCode).to.equal(302)
        Code.expect(res.headers['location']).to.equal(errorPath)
      })
    })
  })
})
